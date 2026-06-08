const { supabase } = require("../config/supabase");
const crypto = require("crypto");

// Registry to allow models to resolve relations dynamically
const modelRegistry = {};

function handleSupabaseError(error) {
  if (!error) return;
  const msg = error.message || JSON.stringify(error);
  const code = error.code ? ` (Code: ${error.code})` : "";
  const details = error.details ? `\nDetails: ${error.details}` : "";
  throw new Error(`Supabase Error: ${msg}${code}${details}`);
}

function registerModel(name, modelClass) {
  modelRegistry[name] = modelClass;
}

// Deep-set values in a document (supporting dot notation and positional "$" operators)
function deepSet(doc, path, value, query = {}) {
  const parts = path.split(".");
  let current = doc;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === "$") {
      // Positional operator! Find the element in the array matching the query criteria
      const parentPath = parts.slice(0, i).join(".");
      let searchVal = null;
      
      // Look for the query value matching the array parent
      for (let [k, v] of Object.entries(query)) {
        if (k.startsWith(parentPath) && (k.endsWith("_id") || k.endsWith("id"))) {
          searchVal = v;
          break;
        }
      }
      
      // Fallback: search for any uuid/objectId-like string in the query values
      if (!searchVal) {
        for (let v of Object.values(query)) {
          if (typeof v === "string" && (v.length === 24 || v.length === 36)) {
            searchVal = v;
            break;
          }
        }
      }

      if (Array.isArray(current)) {
        const index = current.findIndex(item => 
          item && (item.id === searchVal || item._id === searchVal)
        );
        if (index !== -1) {
          const remainingPath = parts.slice(i + 1).join(".");
          if (remainingPath) {
            deepSet(current[index], remainingPath, value, query);
          } else {
            current[index] = value;
          }
        }
      }
      return;
    }

    if (i === parts.length - 1) {
      current[part] = value;
    } else {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  }
}

// Apply Mongo update operators to a document in place
function applyMongoUpdate(doc, updateObj, query = {}) {
  if (!updateObj) return doc;

  const hasOperators = Object.keys(updateObj).some(k => k.startsWith("$"));
  if (!hasOperators) {
    updateObj = { $set: updateObj };
  }

  // 1. Handle $set
  if (updateObj.$set) {
    for (let [path, val] of Object.entries(updateObj.$set)) {
      deepSet(doc, path, val, query);
    }
  }

  // 2. Handle $push
  if (updateObj.$push) {
    for (let [path, val] of Object.entries(updateObj.$push)) {
      if (!doc[path]) doc[path] = [];
      if (!Array.isArray(doc[path])) doc[path] = [doc[path]];

      if (val && typeof val === "object" && val.$each) {
        const items = val.$each.map(item => {
          if (item && typeof item === "object" && !item._id && !item.id) {
            const id = crypto.randomUUID();
            return { id, _id: id, ...item };
          }
          return item;
        });
        doc[path].push(...items);
      } else {
        if (val && typeof val === "object" && !val._id && !val.id) {
          const id = crypto.randomUUID();
          val = { id, _id: id, ...val };
        }
        doc[path].push(val);
      }
    }
  }

  // 3. Handle $pull
  if (updateObj.$pull) {
    for (let [path, matchObj] of Object.entries(updateObj.$pull)) {
      if (Array.isArray(doc[path])) {
        doc[path] = doc[path].filter(item => {
          if (matchObj && typeof matchObj === "object") {
            return !Object.entries(matchObj).every(([k, v]) => {
              const itemKey = k === "_id" ? "id" : k;
              return item[k] === v || item[itemKey] === v;
            });
          } else {
            return item !== matchObj;
          }
        });
      }
    }
  }

  return doc;
}

// Chained Query Builder for Mongoose-like syntax compatibility
class SupabaseQueryBuilder {
  constructor(model, method, args = []) {
    this.model = model;
    this.method = method;
    this.args = args;
    this.filters = [];
    this.sorts = [];
    this.limitVal = null;
    this.populates = [];
  }

  where(query) {
    if (!query) return this;
    for (let [key, val] of Object.entries(query)) {
      const field = key === "_id" ? "id" : key;
      if (val === null) {
        this.filters.push({ field, op: "is", value: null });
      } else if (val && typeof val === "object" && !(val instanceof Date)) {
        if (val.$exists === false || val.$exists === true) {
          if (val.$exists === false) {
            this.filters.push({ field, op: "is", value: null });
          } else {
            this.filters.push({ field, op: "neq", value: null });
          }
        } else if (val.$ne !== undefined) {
          let neVal = val.$ne;
          if (neVal instanceof Date) neVal = neVal.toISOString();
          this.filters.push({ field, op: "neq", value: neVal });
        } else if (val.$lt !== undefined) {
          let ltVal = val.$lt;
          if (ltVal instanceof Date) ltVal = ltVal.toISOString();
          this.filters.push({ field, op: "lt", value: ltVal });
        } else if (val.$lte !== undefined) {
          let lteVal = val.$lte;
          if (lteVal instanceof Date) lteVal = lteVal.toISOString();
          this.filters.push({ field, op: "lte", value: lteVal });
        } else if (val.$gt !== undefined) {
          let gtVal = val.$gt;
          if (gtVal instanceof Date) gtVal = gtVal.toISOString();
          this.filters.push({ field, op: "gt", value: gtVal });
        } else if (val.$gte !== undefined) {
          let gteVal = val.$gte;
          if (gteVal instanceof Date) gteVal = gteVal.toISOString();
          this.filters.push({ field, op: "gte", value: gteVal });
        }
      } else {
        let eqVal = val;
        if (eqVal instanceof Date) eqVal = eqVal.toISOString();
        this.filters.push({ field, op: "eq", value: eqVal });
      }
    }
    return this;
  }

  sort(sortSpec) {
    if (!sortSpec) return this;
    if (typeof sortSpec === "string") {
      const parts = sortSpec.trim().split(/\s+/);
      for (let part of parts) {
        if (part.startsWith("-")) {
          this.sorts.push({ field: part.slice(1), ascending: false });
        } else {
          this.sorts.push({ field: part, ascending: true });
        }
      }
    } else if (typeof sortSpec === "object") {
      for (let [field, direction] of Object.entries(sortSpec)) {
        this.sorts.push({
          field,
          ascending: direction === 1 || direction === "asc"
        });
      }
    }
    return this;
  }

  limit(num) {
    this.limitVal = num;
    return this;
  }

  populate(field) {
    if (typeof field === "string") {
      this.populates.push(field);
    } else if (Array.isArray(field)) {
      this.populates.push(...field);
    }
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    let query = supabase.from(this.model.tableName).select("*");

    // Apply filters
    for (let filter of this.filters) {
      if (filter.op === "eq") {
        query = query.eq(filter.field, filter.value);
      } else if (filter.op === "neq") {
        query = query.neq(filter.field, filter.value);
      } else if (filter.op === "is") {
        query = query.is(filter.field, filter.value);
      } else if (filter.op === "lt") {
        query = query.lt(filter.field, filter.value);
      } else if (filter.op === "lte") {
        query = query.lte(filter.field, filter.value);
      } else if (filter.op === "gt") {
        query = query.gt(filter.field, filter.value);
      } else if (filter.op === "gte") {
        query = query.gte(filter.field, filter.value);
      }
    }

    // Apply sorting
    for (let sort of this.sorts) {
      query = query.order(sort.field, { ascending: sort.ascending });
    }

    // Apply limit
    if (this.limitVal !== null) {
      query = query.limit(this.limitVal);
    }

    // Execute query
    if (this.method === "findOne" || this.method === "findById") {
      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      let result = data && data.length > 0 ? data[0] : null;
      if (result) {
        result = this.model.mapOutput(result);
        await this.resolvePopulates(result);
      }
      return result;
    } else {
      const { data, error } = await query;
      if (error) handleSupabaseError(error);
      const results = (data || []).map(row => this.model.mapOutput(row));
      for (let result of results) {
        await this.resolvePopulates(result);
      }
      return results;
    }
  }

  async resolvePopulates(doc) {
    if (!doc || this.populates.length === 0) return;
    for (let field of this.populates) {
      const relationName = this.model.relations[field];
      if (relationName && doc[field]) {
        const relationModel = modelRegistry[relationName];
        if (relationModel) {
          const related = await relationModel.findById(doc[field]);
          if (related) {
            doc[field] = related;
          }
        }
      }
    }
  }

  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }
}

// Base Supabase Model Class acting as Mongoose Compatibility Layer
class SupabaseModel {
  constructor(tableName, relations = {}) {
    this.tableName = tableName;
    this.relations = relations;
  }

  mapOutput(row) {
    if (!row) return null;
    row._id = row.id;

    // Attach dynamic save() method for compatibility with model.save()
    const self = this;
    row.save = async function() {
      const payload = { ...this };
      delete payload.save;
      delete payload._id;

      const { data, error } = await supabase
        .from(self.tableName)
        .update(payload)
        .eq("id", payload.id)
        .select("*")
        .single();

      if (error) handleSupabaseError(error);
      Object.assign(this, data);
      this._id = this.id;
      return this;
    };

    // Recursively attach mongoose-like .id() method to all arrays
    const attachIdMethod = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
          Object.defineProperty(val, "id", {
            value: function(findId) {
              if (!findId) return null;
              const fIdStr = findId.toString();
              return this.find(item => item && (
                (item.id && item.id.toString() === fIdStr) ||
                (item._id && item._id.toString() === fIdStr)
              ));
            },
            configurable: true,
            writable: true
          });
          val.forEach(item => {
            if (item && typeof item === "object") {
              if (!item.id && !item._id) {
                const itemUUID = crypto.randomUUID();
                item.id = itemUUID;
                item._id = itemUUID;
              } else if (item.id && !item._id) {
                item._id = item.id;
              } else if (item._id && !item.id) {
                item.id = item._id;
              }
            }
            attachIdMethod(item);
          });
        } else if (val && typeof val === "object") {
          attachIdMethod(val);
        }
      }
    };
    attachIdMethod(row);

    return row;
  }

  find(query = {}) {
    const builder = new SupabaseQueryBuilder(this, "find");
    return builder.where(query);
  }

  findOne(query = {}) {
    const builder = new SupabaseQueryBuilder(this, "findOne");
    return builder.where(query);
  }

  findById(id) {
    if (!id) return null;
    const builder = new SupabaseQueryBuilder(this, "findById");
    return builder.where({ _id: id });
  }

  async create(data) {
    const payload = { ...data };
    if (!payload.id && !payload._id) {
      payload.id = crypto.randomUUID();
    } else if (payload._id && !payload.id) {
      payload.id = payload._id;
    }
    delete payload._id;

    const { data: inserted, error } = await supabase
      .from(this.tableName)
      .insert(payload)
      .select("*")
      .single();

    if (error) handleSupabaseError(error);
    return this.mapOutput(inserted);
  }

  async findByIdAndUpdate(id, updateObj, options = {}) {
    return this.findOneAndUpdate({ _id: id }, updateObj, options);
  }

  async findOneAndUpdate(query, updateObj, options = {}) {
    const current = await this.findOne(query);
    if (!current) {
      if (options.upsert) {
        const newDoc = applyMongoUpdate({ id: crypto.randomUUID() }, updateObj, query);
        return this.create(newDoc);
      }
      return null;
    }

    const updated = applyMongoUpdate(JSON.parse(JSON.stringify(current)), updateObj, query);
    delete updated._id;
    delete updated.save;

    const { data: row, error } = await supabase
      .from(this.tableName)
      .update(updated)
      .eq("id", updated.id)
      .select("*")
      .single();

    if (error) handleSupabaseError(error);
    return this.mapOutput(row);
  }

  async findByIdAndDelete(id) {
    const { data: row, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) handleSupabaseError(error);
    return this.mapOutput(row);
  }

  async findOneAndDelete(query) {
    const doc = await this.findOne(query);
    if (!doc) return null;
    return this.findByIdAndDelete(doc.id);
  }

  async updateMany(query, updateObj) {
    const docs = await this.find(query);
    const results = [];
    for (let doc of docs) {
      const updated = await this.findByIdAndUpdate(doc.id, updateObj);
      results.push(updated);
    }
    return results;
  }

  async deleteMany(query = {}) {
    const docs = await this.find(query);
    let count = 0;
    for (let doc of docs) {
      await this.findByIdAndDelete(doc.id);
      count++;
    }
    return { deletedCount: count };
  }

  async countDocuments(query = {}) {
    const docs = await this.find(query);
    return docs.length;
  }
}

module.exports = {
  SupabaseModel,
  registerModel
};
