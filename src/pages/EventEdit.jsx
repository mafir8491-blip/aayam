import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function EventEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [subEvents, setSubEvents] = useState([]);
  const [mainRegSub, setMainRegSub] = useState(null);
  const [error, setError] = useState(null);

  // Event Edit State
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState('Technical');
  const [location, setLocation] = useState('SVNIT Surat');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [about, setAbout] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [customDetails, setCustomDetails] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);

  // Form Fields Builder State (Main Form)
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFieldLabel, setEditFieldLabel] = useState('');
  const [editFieldType, setEditFieldType] = useState('text');
  const [editFieldPlaceholder, setEditFieldPlaceholder] = useState('');
  const [editFieldOptions, setEditFieldOptions] = useState('');
  const [editFieldRequired, setEditFieldRequired] = useState(false);

  // Poster Slideshow State
  const [slideFiles, setSlideFiles] = useState([]);

  // Schedule Cards State
  const [newCardHeading, setNewCardHeading] = useState('');
  const [newCardMode, setNewCardMode] = useState('text'); // 'text' or 'table'
  const [newCardBody, setNewCardBody] = useState('');
  const [newCardColsCount, setNewCardColsCount] = useState(3);
  const [newCardHeaders, setNewCardHeaders] = useState(['Col 1', 'Col 2', 'Col 3']);
  const [newCardRows, setNewCardRows] = useState([['', '', '']]);

  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardHeading, setEditCardHeading] = useState('');
  const [editCardMode, setEditCardMode] = useState('text');
  const [editCardBody, setEditCardBody] = useState('');
  const [editCardColsCount, setEditCardColsCount] = useState(3);
  const [editCardHeaders, setEditCardHeaders] = useState(['', '', '']);
  const [editCardRows, setEditCardRows] = useState([['', '', '']]);

  // Sub-Event CRUD State
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubDay, setNewSubDay] = useState(1);
  const [newSubDate, setNewSubDate] = useState('');
  const [newSubStart, setNewSubStart] = useState('');
  const [newSubEnd, setNewSubEnd] = useState('');
  const [newSubDeadline, setNewSubDeadline] = useState('');
  const [newSubMaxParts, setNewSubMaxParts] = useState('');
  const [newSubIsGroup, setNewSubIsGroup] = useState(false);
  const [newSubMinTeam, setNewSubMinTeam] = useState(1);
  const [newSubMaxTeam, setNewSubMaxTeam] = useState(1);
  const [newSubQrFile, setNewSubQrFile] = useState(null);
  const [newSubPosterFile, setNewSubPosterFile] = useState(null);
  const [newSubExternalLink, setNewSubExternalLink] = useState('');

  // Sub-Event Editing State Map (index key is sub-event ID)
  const [editingSubEventId, setEditingSubEventId] = useState(null);
  const [editSubTitle, setEditSubTitle] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');
  const [editSubDay, setEditSubDay] = useState(1);
  const [editSubDate, setEditSubDate] = useState('');
  const [editSubStart, setEditSubStart] = useState('');
  const [editSubEnd, setEditSubEnd] = useState('');
  const [editSubDeadline, setEditSubDeadline] = useState('');
  const [editSubMaxParts, setEditSubMaxParts] = useState('');
  const [editSubIsGroup, setEditSubIsGroup] = useState(false);
  const [editSubMinTeam, setEditSubMinTeam] = useState(1);
  const [editSubMaxTeam, setEditSubMaxTeam] = useState(1);
  const [editSubQrFile, setEditSubQrFile] = useState(null);
  const [editSubPosterFile, setEditSubPosterFile] = useState(null);
  const [editSubExternalLink, setEditSubExternalLink] = useState('');

  // Sub-event Form Builder Fields State
  const [newSubFieldLabel, setNewSubFieldLabel] = useState('');
  const [newSubFieldType, setNewSubFieldType] = useState('text');
  const [newSubFieldPlaceholder, setNewSubFieldPlaceholder] = useState('');
  const [newSubFieldOptions, setNewSubFieldOptions] = useState('');
  const [newSubFieldRequired, setNewSubFieldRequired] = useState(false);
  const [editingSubFieldId, setEditingSubFieldId] = useState(null);
  const [editSubFieldLabel, setEditSubFieldLabel] = useState('');
  const [editSubFieldType, setEditSubFieldType] = useState('text');
  const [editSubFieldPlaceholder, setEditSubFieldPlaceholder] = useState('');
  const [editSubFieldOptions, setEditSubFieldOptions] = useState('');
  const [editSubFieldRequired, setEditSubFieldRequired] = useState(false);

  // Time Option helper
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const suffix = h < 12 ? 'AM' : 'PM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const mm = m === 0 ? '00' : '30';
      const hh = h12 < 10 ? '0' + h12 : '' + h12;
      const label = `${hh}:${mm} ${suffix}`;
      timeOptions.push(label);
    }
  }

  // Load Admin User, Event details
  const loadData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        navigate('/auth');
        return;
      }
      const meJson = await meRes.json();
      if (!meJson.user || (meJson.user.role !== 'admin' && meJson.user.role !== 'superadmin')) {
        navigate('/auth');
        return;
      }
      setUser(meJson.user);

      const res = await fetch(`/api/events/edit/${id}`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to load edit details');
      }
      const json = await res.json();
      setEvent(json.event);
      setSubEvents(json.subEvents || []);
      setMainRegSub(json.mainRegSub);

      // Prepopulate state
      setTitle(json.event.title || '');
      setIsPublic(json.event.isPublic !== false);
      setCategory(json.event.category || 'Technical');
      setLocation(json.event.location || 'SVNIT Surat');
      setShortDesc(json.event.shortDescription || '');
      setDescription(json.event.description || '');
      setAbout(json.event.about || '');
      setStartDate(json.event.startDate ? json.event.startDate.split('T')[0] : '');
      setEndDate(json.event.endDate ? json.event.endDate.split('T')[0] : '');
      setRegistrationLink(json.event.registrationLink || '');
      setCustomDetails(json.event.customDetails || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Handle Main Details Submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('isPublic', isPublic ? 'true' : 'false');
    formData.append('category', category);
    formData.append('location', location);
    formData.append('shortDescription', shortDesc);
    formData.append('description', description);
    formData.append('about', about);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('registrationLink', registrationLink);
    formData.append('customDetails', JSON.stringify(customDetails));
    if (bannerFile) {
      formData.append('bannerImage', bannerFile);
    }

    try {
      const res = await fetch(`/api/events/edit/${id}`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save event details');
      alert('Event details updated successfully!');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Custom Details Builder Helpers
  const addCustomDetailRow = () => {
    setCustomDetails([...customDetails, { key: '', value: '' }]);
  };
  const updateCustomDetailRow = (index, field, val) => {
    const updated = [...customDetails];
    updated[index][field] = val;
    setCustomDetails(updated);
  };
  const removeCustomDetailRow = (index) => {
    setCustomDetails(customDetails.filter((_, i) => i !== index));
  };

  // Custom Form Builder Helpers (Main Form)
  const handleEnableForm = async () => {
    try {
      const res = await fetch(`/api/events/${id}/create-form`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to enable form');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDisableForm = async () => {
    if (!confirm('WARNING: Disabling the custom form will permanently delete all fields and all existing registrations. Continue?')) return;
    try {
      const res = await fetch(`/api/events/${id}/delete-form`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to disable form');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;
    const optionsArray = newFieldOptions
      ? newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/subevents/${mainRegSub._id}/fields/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newFieldLabel,
          type: newFieldType,
          placeholder: newFieldPlaceholder,
          options: optionsArray,
          required: newFieldRequired,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add field');
      setNewFieldLabel('');
      setNewFieldPlaceholder('');
      setNewFieldOptions('');
      setNewFieldRequired(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditField = (field) => {
    setEditingFieldId(field._id);
    setEditFieldLabel(field.label);
    setEditFieldType(field.type);
    setEditFieldPlaceholder(field.placeholder || '');
    setEditFieldOptions(field.options ? (Array.isArray(field.options) ? field.options.join(', ') : String(field.options)) : '');
    setEditFieldRequired(field.required || false);
  };

  const handleSaveEditField = async (e, fieldId) => {
    e.preventDefault();
    const optionsArray = editFieldOptions
      ? editFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/subevents/${mainRegSub._id}/fields/${fieldId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editFieldLabel,
          type: editFieldType,
          placeholder: editFieldPlaceholder,
          options: optionsArray,
          required: editFieldRequired,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save field');
      setEditingFieldId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Delete this field?')) return;
    try {
      const res = await fetch(`/api/subevents/${mainRegSub._id}/fields/${fieldId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to delete field');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Poster Slideshow Helpers
  const handleUploadSlides = async (e) => {
    e.preventDefault();
    if (slideFiles.length === 0) return;
    const formData = new FormData();
    Array.from(slideFiles).forEach((f) => {
      formData.append('posterSlides', f);
    });

    try {
      const res = await fetch(`/api/events/${id}/poster-slides`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to upload slides');
      setSlideFiles([]);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSlide = async (index) => {
    if (!confirm('Remove this slide?')) return;
    try {
      const res = await fetch(`/api/events/${id}/poster-slides/${index}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Schedule Cards Helpers
  const buildGrid = (mode, colsCount) => {
    const defaultHeaders = Array.from({ length: colsCount }, (_, i) => `Col ${i + 1}`);
    const defaultRows = [Array.from({ length: colsCount }, () => '')];
    if (mode === 'new') {
      setNewCardHeaders(defaultHeaders);
      setNewCardRows(defaultRows);
    } else {
      setEditCardHeaders(defaultHeaders);
      setEditCardRows(defaultRows);
    }
  };

  const updateHeader = (mode, colIndex, val) => {
    if (mode === 'new') {
      const updated = [...newCardHeaders];
      updated[colIndex] = val;
      setNewCardHeaders(updated);
    } else {
      const updated = [...editCardHeaders];
      updated[colIndex] = val;
      setEditCardHeaders(updated);
    }
  };

  const updateCell = (mode, rowIndex, colIndex, val) => {
    if (mode === 'new') {
      const updated = [...newCardRows];
      updated[rowIndex][colIndex] = val;
      setNewCardRows(updated);
    } else {
      const updated = [...editCardRows];
      updated[rowIndex][colIndex] = val;
      setEditCardRows(updated);
    }
  };

  const addRowToTable = (mode) => {
    if (mode === 'new') {
      setNewCardRows([...newCardRows, Array.from({ length: newCardColsCount }, () => '')]);
    } else {
      setEditCardRows([...editCardRows, Array.from({ length: editCardColsCount }, () => '')]);
    }
  };

  const removeRowFromTable = (mode, rowIndex) => {
    if (mode === 'new') {
      setNewCardRows(newCardRows.filter((_, i) => i !== rowIndex));
    } else {
      setEditCardRows(editCardRows.filter((_, i) => i !== rowIndex));
    }
  };

  const handleAddScheduleCard = async (e) => {
    e.preventDefault();
    if (!newCardHeading.trim()) return;

    let tableData = null;
    if (newCardMode === 'table') {
      tableData = {
        columns: newCardHeaders,
        rows: newCardRows,
      };
    }

    try {
      const res = await fetch(`/api/events/${id}/schedule-cards/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: newCardHeading,
          body: newCardMode === 'text' ? newCardBody : '',
          tableData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add card');
      setNewCardHeading('');
      setNewCardBody('');
      setNewCardRows([['', '', '']]);
      setNewCardMode('text');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditCard = (card) => {
    setEditingCardId(card._id);
    setEditCardHeading(card.heading);
    setEditCardBody(card.body || '');
    if (card.tableData && card.tableData.columns && card.tableData.columns.length > 0) {
      setEditCardMode('table');
      setEditCardColsCount(card.tableData.columns.length);
      setEditCardHeaders(card.tableData.columns);
      setEditCardRows(card.tableData.rows || [[]]);
    } else {
      setEditCardMode('text');
      setEditCardColsCount(3);
      setEditCardHeaders(['Col 1', 'Col 2', 'Col 3']);
      setEditCardRows([['', '', '']]);
    }
  };

  const handleSaveEditCard = async (e, cardId) => {
    e.preventDefault();
    let tableData = null;
    if (editCardMode === 'table') {
      tableData = {
        columns: editCardHeaders,
        rows: editCardRows,
      };
    }

    try {
      const res = await fetch(`/api/events/${id}/schedule-cards/${cardId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: editCardHeading,
          body: editCardMode === 'text' ? editCardBody : '',
          tableData,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save card');
      setEditingCardId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Delete this card?')) return;
    try {
      const res = await fetch(`/api/events/${id}/schedule-cards/${cardId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Sub-Event CRUD Helpers
  const handleAddSubEvent = async (e) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;

    const formData = new FormData();
    formData.append('title', newSubTitle);
    formData.append('description', newSubDesc);
    formData.append('dayNumber', newSubDay);
    formData.append('eventDate', newSubDate);
    formData.append('startTime', newSubStart);
    formData.append('endTime', newSubEnd);
    formData.append('registrationDeadline', newSubDeadline);
    formData.append('maxParticipants', newSubMaxParts);
    formData.append('isGroupEvent', newSubIsGroup ? 'true' : 'false');
    formData.append('minTeamSize', newSubMinTeam);
    formData.append('maxTeamSize', newSubMaxTeam);
    formData.append('externalRegistrationLink', newSubExternalLink);
    if (newSubQrFile) formData.append('qrImage', newSubQrFile);
    if (newSubPosterFile) formData.append('posterImage', newSubPosterFile);

    try {
      const res = await fetch(`/api/events/${id}/subevents/add`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add sub-event');
      alert('Sub-event created successfully!');
      // Reset fields
      setNewSubTitle('');
      setNewSubDesc('');
      setNewSubDay(1);
      setNewSubDate('');
      setNewSubStart('');
      setNewSubEnd('');
      setNewSubDeadline('');
      setNewSubMaxParts('');
      setNewSubIsGroup(false);
      setNewSubMinTeam(1);
      setNewSubMaxTeam(1);
      setNewSubQrFile(null);
      setNewSubPosterFile(null);
      setNewSubExternalLink('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditSubEvent = (sub) => {
    setEditingSubEventId(sub._id);
    setEditSubTitle(sub.title || '');
    setEditSubDesc(sub.description || '');
    setEditSubDay(sub.dayNumber || 1);
    setEditSubDate(sub.eventDate ? sub.eventDate.split('T')[0] : '');
    setEditSubStart(sub.startTime || '');
    setEditSubEnd(sub.endTime || '');
    setEditSubDeadline(sub.registrationDeadline ? new Date(sub.registrationDeadline).toISOString().slice(0, 16) : '');
    setEditSubMaxParts(sub.maxParticipants || '');
    setEditSubIsGroup(sub.isGroupEvent || false);
    setEditSubMinTeam(sub.minTeamSize || 1);
    setEditSubMaxTeam(sub.maxTeamSize || 1);
    setEditSubExternalLink(sub.externalRegistrationLink || '');
    setEditSubQrFile(null);
    setEditSubPosterFile(null);
  };

  const handleSaveEditSubEvent = async (e, subId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', editSubTitle);
    formData.append('description', editSubDesc);
    formData.append('dayNumber', editSubDay);
    formData.append('eventDate', editSubDate);
    formData.append('startTime', editSubStart);
    formData.append('endTime', editSubEnd);
    formData.append('registrationDeadline', editSubDeadline);
    formData.append('maxParticipants', editSubMaxParts);
    formData.append('isGroupEvent', editSubIsGroup ? 'true' : 'false');
    formData.append('minTeamSize', editSubMinTeam);
    formData.append('maxTeamSize', editSubMaxTeam);
    formData.append('externalRegistrationLink', editSubExternalLink);
    if (editSubQrFile) formData.append('qrImage', editSubQrFile);
    if (editSubPosterFile) formData.append('posterImage', editSubPosterFile);

    try {
      const res = await fetch(`/api/subevents/${subId}/edit`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update sub-event');
      setEditingSubEventId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubEvent = async (subId) => {
    if (!confirm('Are you sure you want to permanently delete this sub-event and all its registrations?')) return;
    try {
      const res = await fetch(`/api/subevents/${subId}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Delete failed');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubQr = async (subId) => {
    if (!confirm('Delete QR code image?')) return;
    try {
      const res = await fetch(`/api/subevents/${subId}/qr/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete QR');
      loadData();
      if (editingSubEventId === subId) {
        setEditSubQrFile(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubPoster = async (subId) => {
    if (!confirm('Delete Poster image?')) return;
    try {
      const res = await fetch(`/api/subevents/${subId}/poster/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete poster');
      loadData();
      if (editingSubEventId === subId) {
        setEditSubPosterFile(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Sub-Event Fields CRUD Helpers
  const handleAddSubField = async (e, subId) => {
    e.preventDefault();
    if (!newSubFieldLabel.trim()) return;
    const optionsArray = newSubFieldOptions
      ? newSubFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/subevents/${subId}/fields/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newSubFieldLabel,
          type: newSubFieldType,
          placeholder: newSubFieldPlaceholder,
          options: optionsArray,
          required: newSubFieldRequired,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add sub-event field');
      setNewSubFieldLabel('');
      setNewSubFieldPlaceholder('');
      setNewSubFieldOptions('');
      setNewSubFieldRequired(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditSubField = (field) => {
    setEditingSubFieldId(field._id);
    setEditSubFieldLabel(field.label);
    setEditSubFieldType(field.type);
    setEditSubFieldPlaceholder(field.placeholder || '');
    setEditSubFieldOptions(field.options ? (Array.isArray(field.options) ? field.options.join(', ') : String(field.options)) : '');
    setEditSubFieldRequired(field.required || false);
  };

  const handleSaveEditSubField = async (e, subId, fieldId) => {
    e.preventDefault();
    const optionsArray = editSubFieldOptions
      ? editSubFieldOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/subevents/${subId}/fields/${fieldId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editSubFieldLabel,
          type: editSubFieldType,
          placeholder: editSubFieldPlaceholder,
          options: optionsArray,
          required: editSubFieldRequired,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save sub-event field');
      setEditingSubFieldId(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubField = async (subId, fieldId) => {
    if (!confirm('Delete this field?')) return;
    try {
      const res = await fetch(`/api/subevents/${subId}/fields/${fieldId}/delete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to delete field');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" style={{ color: 'var(--br)' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Entering Event Administration Console...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-5 text-center min-vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="text-danger">Access Error</h3>
        <p className="text-muted">{error || 'Event details not loaded'}</p>
        <Link to="/events" className="btn btn-outline-warning mt-3">Back to Events</Link>
      </div>
    );
  }

  /* ── Design tokens matching the rest of the site ── */
  const BR      = '#a67c52';
  const BR_D    = '#8a6240';
  const BG_PAGE = '#fdf8f3';
  const BG_CARD = '#fdfaf6';
  const BG_INNER= '#f5ede3';
  const TX      = '#3a2a1a';
  const TX_MUT  = '#8a7a6a';
  const BORDER  = '#e0d5c8';

  const sectionCard = {
    background: BG_CARD,
    border: `1px solid ${BORDER}`,
    borderRadius: '14px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  };
  const inputCls = {
    background: '#fff',
    border: `1.5px solid ${BORDER}`,
    borderRadius: '8px',
    color: TX,
    padding: '8px 12px',
    width: '100%',
    fontSize: '0.9rem',
    outline: 'none',
  };
  const labelCls = {
    fontSize: '0.78rem',
    fontWeight: 700,
    color: BR,
    marginBottom: '5px',
    display: 'block',
  };
  const btnPrimary = {
    background: BR,
    border: `1.5px solid ${BR}`,
    color: '#fff',
    borderRadius: '8px',
    padding: '8px 20px',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
  };
  const btnOutline = {
    background: 'transparent',
    border: `1.5px solid ${BORDER}`,
    color: TX_MUT,
    borderRadius: '8px',
    padding: '8px 20px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  };
  const btnDanger = {
    background: 'transparent',
    border: '1.5px solid #e74c3c',
    color: '#e74c3c',
    borderRadius: '8px',
    padding: '6px 14px',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  };
  const btnSuccess = {
    background: '#27ae60',
    border: '1.5px solid #27ae60',
    color: '#fff',
    borderRadius: '8px',
    padding: '6px 14px',
    fontWeight: 600,
    fontSize: '0.8rem',
    cursor: 'pointer',
  };
  const sectionHeading = {
    fontFamily: 'Playfair Display, serif',
    fontSize: '1.15rem',
    fontWeight: 800,
    color: TX,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${BORDER}`,
  };

  return (
    <div style={{ background: BG_PAGE, minHeight: '100vh', paddingBottom: '60px' }}>
    <div className="container py-5" style={{ maxWidth: '900px' }}>
      
      {/* Page Header */}
      <div className="mb-4">
        <Link to={`/events/${event._id}`} className="btn-details d-inline-flex align-items-center gap-2 mb-3" style={{ textDecoration: 'none' }}>
          <i className="bi bi-arrow-left"></i> Back to Event
        </Link>
        <div className="section-label">Admin Console</div>
        <h1 className="page-title fw-bold" style={{color:"#a67c52", fontFamily: 'var(--font-display, serif)', fontSize: '2.2rem' }}>Edit Event: {event.title}</h1>
      </div>

      {/* SECTION 1 - EVENT DETAILS FORM */}
      <div className="card p-4 mb-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px' }}>
        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>
          <span>📋</span> Event Details
        </h2>
        <form onSubmit={handleDetailsSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Event Visibility</label>
            <div className="d-flex gap-3">
              <label className="d-flex align-items-center gap-2 cursor-pointer">
                <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} />
                <span>🌐 Public <small className="text-muted">(Details visible to everyone)</small></span>
              </label>
              <label className="d-flex align-items-center gap-2 cursor-pointer">
                <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} />
                <span>🔒 Private <small className="text-muted">(Hidden / Poster only)</small></span>
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Event Title *</label>
            <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Category *</label>
              <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={category} onChange={(e) => setCategory(e.target.value)} required>
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Location *</label>
              <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Short Description *</label>
            <textarea className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} rows="2" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Full Description * <small className="text-muted">(HTML tags supported)</small></label>
            <textarea className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} rows="4" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>About Event <small className="text-muted">(Optional, HTML supported)</small></label>
            <textarea className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} rows="3" value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Start Date *</label>
              <input type="date" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>End Date *</label>
              <input type="date" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Registration Link <small className="text-muted">(Optional Google Form/External link)</small></label>
            <input type="url" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} placeholder="https://forms.gle/..." />
          </div>

          {/* Custom Details Key-Values */}
          <div className="mb-4">
            <label className="form-label small fw-bold d-block" style={{color:"#a67c52"}}>Custom Event Details <small className="text-muted">(Entry Fee, Prize Pool, etc.)</small></label>
            <div className="d-flex flex-column gap-2 mb-2">
              {customDetails.map((detail, idx) => (
                <div key={idx} className="d-flex gap-2">
                  <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px", flex: 1}} placeholder="Key (e.g. Fee)" value={detail.key} onChange={(e) => updateCustomDetailRow(idx, 'key', e.target.value)} />
                  <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px", flex: 1}} placeholder="Value (e.g. Free)" value={detail.value} onChange={(e) => updateCustomDetailRow(idx, 'value', e.target.value)} />
                  <button type="button" className="btn btn-danger" onClick={() => removeCustomDetailRow(idx)}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-sm" style={{border:"1.5px solid #a67c52",color:"#a67c52",background:"transparent"}} onClick={addCustomDetailRow}>+ Add Custom Detail</button>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold d-block" style={{color:"#a67c52"}}>Replace Banner Image</label>
            {event.bannerImage && (
              <div className="mb-2">
                <img src={event.bannerImage} alt="Current banner" style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <div className="small text-muted mt-1">Current Banner Image</div>
              </div>
            )}
            <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn-register py-2 px-4">Save Event Details</button>
            <Link to={`/events/${event._id}`} className="btn btn-outline-secondary py-2 px-4">Cancel</Link>
          </div>
        </form>
      </div>

      {/* SECTION 1A - CUSTOM REGISTRATION FORM BUILDER */}
      <div className="card p-4 mb-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px', borderLeft: '4px solid #27ae60' }}>
        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>
          <span>📝</span> Event Registration Form
        </h2>
        {!mainRegSub ? (
          <div>
            <p className="text-muted small mb-3">Enable a custom registration form to let participants sign up directly on this site. Built-in fields (Name, Email, Phone) are always included.</p>
            <button type="button" className="btn btn-success" onClick={handleEnableForm}>Enable Custom Registration Form</button>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <span className="badge bg-success">Active Custom Form</span>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleDisableForm}>Disable &amp; Delete Form</button>
            </div>

            <div className="mb-3">
              <h3 className="h6 fw-bold mb-2" style={{color:"#a67c52"}}>Existing Custom Fields</h3>
              <div className="d-flex flex-column gap-2 mb-3">
                {mainRegSub.formFields && mainRegSub.formFields.length > 0 ? (
                  mainRegSub.formFields.map((field) => (
                    <div key={field._id} className="p-2 rounded" style={{border:"1px solid #e0d5c8",background:"#fdfaf6"}}>
                      {editingFieldId === field._id ? (
                        <form onSubmit={(e) => handleSaveEditField(e, field._id)}>
                          <div className="row g-2 mb-2">
                            <div className="col-12">
                              <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Field Label" value={editFieldLabel} onChange={(e) => setEditFieldLabel(e.target.value)} required />
                            </div>
                            <div className="col-sm-6">
                              <select className="form-select form-select-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} value={editFieldType} onChange={(e) => setEditFieldType(e.target.value)} required>
                                <option value="text">Short Answer (Text)</option>
                                <option value="textarea">Paragraph (Textarea)</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="checkbox">Checkboxes</option>
                                <option value="file">File Upload</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                              </select>
                            </div>
                            <div className="col-sm-6">
                              <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Placeholder Hint" value={editFieldPlaceholder} onChange={(e) => setEditFieldPlaceholder(e.target.value)} />
                            </div>
                            {(editFieldType === 'dropdown' || editFieldType === 'checkbox') && (
                              <div className="col-12">
                                <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Options (comma separated: Opt1, Opt2)" value={editFieldOptions} onChange={(e) => setEditFieldOptions(e.target.value)} required />
                              </div>
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <label className="d-flex align-items-center gap-1 small text-muted">
                              <input type="checkbox" checked={editFieldRequired} onChange={(e) => setEditFieldRequired(e.target.checked)} />
                              Required Field
                            </label>
                            <div className="d-flex gap-1">
                              <button type="submit" className="btn btn-success btn-sm">Save</button>
                              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingFieldId(null)}>Cancel</button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-secondary me-2">{field.type}</span>
                            <strong style={{color:"#3a2a1a"}}>{field.label}</strong>
                            {field.required && <span className="text-danger ms-1">*</span>}
                            {field.options && (Array.isArray(field.options) ? field.options : []).length > 0 && (
                              <div className="small text-muted mt-1">Options: {(Array.isArray(field.options) ? field.options : []).join(', ')}</div>
                            )}
                          </div>
                          <div className="d-flex gap-1">
                            <button type="button" className="btn btn-sm" style={{border:"1.5px solid #a67c52",color:"#a67c52",background:"transparent"}} onClick={() => startEditField(field)}>Edit</button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteField(field._id)}>✕</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted small italic">No extra custom fields added yet.</p>
                )}
              </div>
            </div>

            {/* Add New Field form */}
            <form onSubmit={handleAddField} className="p-3 rounded" style={{border:"1px solid #e0d5c8",background:"#f5ede3"}}>
              <h4 className="h6 fw-bold mb-2" style={{color:"#a67c52"}}>➕ Add New Field</h4>
              <div className="row g-2 mb-2">
                <div className="col-12">
                  <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Field Label (e.g. Branch, Roll Number)" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} required />
                </div>
                <div className="col-sm-6">
                  <select className="form-select form-select-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)} required>
                    <option value="text">Short Answer (Text)</option>
                    <option value="textarea">Paragraph (Textarea)</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkboxes</option>
                    <option value="file">File Upload</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Placeholder Hint" value={newFieldPlaceholder} onChange={(e) => setNewFieldPlaceholder(e.target.value)} />
                </div>
                {(newFieldType === 'dropdown' || newFieldType === 'checkbox') && (
                  <div className="col-12">
                    <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Options (comma separated: Opt1, Opt2)" value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)} required />
                  </div>
                )}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <label className="d-flex align-items-center gap-1 small text-muted">
                  <input type="checkbox" checked={newFieldRequired} onChange={(e) => setNewFieldRequired(e.target.checked)} />
                  Required Field
                </label>
                <button type="submit" className="btn btn-sm" style={{background:"#a67c52",border:"1.5px solid #a67c52",color:"#fff"}}>Add Field</button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* SECTION 1B - POSTER SLIDESHOW */}
      <div className="card p-4 mb-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px', borderLeft: '4px solid #6c63ff' }}>
        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>
          <span>🖼</span> Poster Slideshow
        </h2>
        {event.posterSlides && event.posterSlides.length > 0 ? (
          <div className="d-flex flex-wrap gap-3 mb-3">
            {event.posterSlides.map((slide, si) => (
              <div key={si} className="position-relative" style={{ width: '120px' }}>
                <img src={slide} alt={`Slide ${si + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button type="button" className="btn btn-danger btn-sm position-absolute" style={{ top: '4px', right: '4px', padding: '1px 5px', fontSize: '0.7rem' }} onClick={() => handleDeleteSlide(si)}>✕</button>
                <div className="small text-muted text-center mt-1">Slide {si + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted small mb-3 italic">No slideshow posters added. The main banner is shown by default.</p>
        )}

        <form onSubmit={handleUploadSlides}>
          <div className="mb-3">
            <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} multiple accept="image/*" onChange={(e) => setSlideFiles(e.target.files)} />
          </div>
          <button type="submit" className="btn btn-sm btn-outline-warning" disabled={slideFiles.length === 0}>Upload Slides</button>
        </form>
      </div>

      {/* SECTION 1C - SCHEDULE / INFO CARDS */}
      <div className="card p-4 mb-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px', borderLeft: '4px solid #a67c52' }}>
        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>
          <span>📅</span> Schedule &amp; Info Cards
        </h2>

        {/* Existing cards list */}
        {event.scheduleCards && event.scheduleCards.length > 0 ? (
          <div className="d-flex flex-column gap-2 mb-4">
            {event.scheduleCards.map((card) => (
              <div key={card._id} className="p-3 rounded" style={{border:"1px solid #e0d5c8",background:"#f5ede3"}}>
                {editingCardId === card._id ? (
                  <form onSubmit={(e) => handleSaveEditCard(e, card._id)}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Heading *</label>
                      <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} value={editCardHeading} onChange={(e) => setEditCardHeading(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <div className="btn-group btn-group-sm mb-2">
                        <button type="button" className="btn btn-sm" onClick={() => setEditCardMode('text')}>📝 Rich Text</button>
                        <button type="button" className="btn btn-sm" onClick={() => setEditCardMode('table')}>📊 Table</button>
                      </div>
                    </div>

                    {editCardMode === 'text' ? (
                      <div className="mb-3">
                        <textarea className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} rows="3" placeholder="Card body text (HTML supported)" value={editCardBody} onChange={(e) => setEditCardBody(e.target.value)} />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <label className="small text-muted mb-0">Cols:</label>
                          <input type="number" min="1" max="10" value={editCardColsCount} onChange={(e) => {
                            const newCols = parseInt(e.target.value) || 3;
                            setEditCardColsCount(newCols);
                            buildGrid('edit', newCols);
                          }} className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8", width: '60px'}} />
                          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => addRowToTable('edit')}>+ Row</button>
                        </div>
                        <div className="table-responsive">
                          <table className="table table-bordered table-sm" style={{background:"#fff",color:"#3a2a1a"}}>
                            <thead>
                              <tr>
                                {editCardHeaders.map((h, ci) => (
                                  <th key={ci}>
                                    <input type="text" className="form-control form-control-sm text-center fw-bold" style={{background:"#fff",color:"#3a2a1a",border:"none"}} value={h} onChange={(e) => updateHeader('edit', ci, e.target.value)} />
                                  </th>
                                ))}
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {editCardRows.map((row, ri) => (
                                <tr key={ri}>
                                  {editCardHeaders.map((_, ci) => (
                                    <td key={ci}>
                                      <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"none"}} value={row[ci] || ''} onChange={(e) => updateCell('edit', ri, ci, e.target.value)} />
                                    </td>
                                  ))}
                                  <td className="text-center">
                                    <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => removeRowFromTable('edit', ri)}>✕</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success btn-sm">Save Card</button>
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingCardId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong style={{color:"#3a2a1a"}}><i className="bi bi-calendar-week text-warning me-2"></i>{card.heading}</strong>
                      <span className="badge bg-secondary ms-2">{card.body ? 'Text' : 'Table'}</span>
                    </div>
                    <div className="d-flex gap-1">
                      <button type="button" className="btn btn-sm" style={{border:"1.5px solid #a67c52",color:"#a67c52",background:"transparent"}} onClick={() => startEditCard(card)}>Edit</button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteCard(card._id)}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted small mb-4 italic">No schedule cards defined yet.</p>
        )}

        {/* Add new card form */}
        <form onSubmit={handleAddScheduleCard} className="p-3 rounded" style={{border:"1px solid #e0d5c8",background:"#f5ede3"}}>
          <h3 className="h6 fw-bold mb-2" style={{color:"#a67c52"}}>➕ Add New Card</h3>
          <div className="mb-3">
            <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Heading (e.g. Day 1 — 12 Oct)" value={newCardHeading} onChange={(e) => setNewCardHeading(e.target.value)} required />
          </div>
          <div className="mb-3">
            <div className="btn-group btn-group-sm mb-2">
              <button type="button" className="btn btn-sm" onClick={() => setNewCardMode('text')}>📝 Rich Text</button>
              <button type="button" className="btn btn-sm" onClick={() => setNewCardMode('table')}>📊 Table</button>
            </div>
          </div>

          {newCardMode === 'text' ? (
            <div className="mb-3">
              <textarea className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} rows="3" placeholder="Card body details (HTML tags allowed)" value={newCardBody} onChange={(e) => setNewCardBody(e.target.value)} />
            </div>
          ) : (
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <label className="small text-muted mb-0">Columns:</label>
                <input type="number" min="1" max="10" value={newCardColsCount} onChange={(e) => {
                  const newCols = parseInt(e.target.value) || 3;
                  setNewCardColsCount(newCols);
                  buildGrid('new', newCols);
                }} className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8", width: '60px'}} />
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => addRowToTable('new')}>+ Row</button>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered table-sm" style={{background:"#fff",color:"#3a2a1a"}}>
                  <thead>
                    <tr>
                      {newCardHeaders.map((h, ci) => (
                        <th key={ci}>
                          <input type="text" className="form-control form-control-sm text-center fw-bold" style={{background:"#fff",color:"#3a2a1a",border:"none"}} value={h} onChange={(e) => updateHeader('new', ci, e.target.value)} />
                        </th>
                      ))}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newCardRows.map((row, ri) => (
                      <tr key={ri}>
                        {newCardHeaders.map((_, ci) => (
                          <td key={ci}>
                            <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"none"}} value={row[ci] || ''} onChange={(e) => updateCell('new', ri, ci, e.target.value)} />
                          </td>
                        ))}
                        <td className="text-center">
                          <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => removeRowFromTable('new', ri)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-sm" style={{background:"#a67c52",border:"1.5px solid #a67c52",color:"#fff"}}>Add Card</button>
        </form>
      </div>

      {/* SECTION 2 - CREATE NEW SUB-EVENT */}
      <div className="card p-4 mb-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px' }}>
        <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>
          <span>➕</span> Create New Sub-Event (Session)
        </h2>
        <form onSubmit={handleAddSubEvent}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Sub-Event Title *</label>
              <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} placeholder="e.g. Workshop Session, Coding Track" value={newSubTitle} onChange={(e) => setNewSubTitle(e.target.value)} required />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Description</label>
              <textarea className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} rows="2" value={newSubDesc} onChange={(e) => setNewSubDesc(e.target.value)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Day Number</label>
              <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubDay} onChange={(e) => setNewSubDay(parseInt(e.target.value) || 1)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Event Date</label>
              <input type="date" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubDate} onChange={(e) => setNewSubDate(e.target.value)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Start Time</label>
              <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubStart} onChange={(e) => setNewSubStart(e.target.value)}>
                <option value="">— Select —</option>
                {timeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>End Time</label>
              <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubEnd} onChange={(e) => setNewSubEnd(e.target.value)}>
                <option value="">— Select —</option>
                {timeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Registration Deadline</label>
              <input type="datetime-local" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubDeadline} onChange={(e) => setNewSubDeadline(e.target.value)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Max Participants <small className="text-muted">(Optional)</small></label>
              <input type="number" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} placeholder="Unlimited" value={newSubMaxParts} onChange={(e) => setNewSubMaxParts(e.target.value)} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Registration Type</label>
              <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubIsGroup ? 'true' : 'false'} onChange={(e) => {
                const isG = e.target.value === 'true';
                setNewSubIsGroup(isG);
                if (!isG) {
                  setNewSubMinTeam(1);
                  setNewSubMaxTeam(1);
                }
              }}>
                <option value="false">👤 Individual</option>
                <option value="true">👥 Team / Group</option>
              </select>
            </div>
            {newSubIsGroup && (
              <>
                <div className="col-sm-6">
                  <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Min Team Size</label>
                  <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubMinTeam} onChange={(e) => setNewSubMinTeam(parseInt(e.target.value) || 1)} />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Max Team Size</label>
                  <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={newSubMaxTeam} onChange={(e) => setNewSubMaxTeam(parseInt(e.target.value) || 1)} />
                </div>
              </>
            )}
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>QR Image</label>
              <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} accept="image/*" onChange={(e) => setNewSubQrFile(e.target.files[0])} />
            </div>
            <div className="col-sm-6">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Sub-Event Poster Image</label>
              <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} accept="image/*" onChange={(e) => setNewSubPosterFile(e.target.files[0])} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>External Google Forms Link <small className="text-muted">(Optional)</small></label>
              <input type="url" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} placeholder="https://forms.gle/..." value={newSubExternalLink} onChange={(e) => setNewSubExternalLink(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn mt-3" style={{background:"#a67c52",border:"1.5px solid #a67c52",color:"#fff",padding:"10px 24px",fontWeight:700}}>Create Sub-Event</button>
        </form>
      </div>

      {/* SECTION 3 - EXISTING SUB-EVENTS PANEL */}
      <div className="mb-5">
        <h2 className="h4 fw-bold mb-3" style={{color:"#3a2a1a",fontFamily:"Playfair Display,serif"}}>Existing Sub-Events ({subEvents.length})</h2>
        {subEvents.length === 0 ? (
          <div className="p-4 text-center rounded text-muted" style={{border:"1.5px dashed #e0d5c8",background:"#fdfaf6",fontStyle:"italic"}}>No sub-events created yet.</div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {subEvents.map((sub, sIdx) => {
              const isEditing = editingSubEventId === sub._id;
              return (
                <div key={sub._id} className="card p-4" style={{ background: '#fdfaf6', border: '1px solid #e0d5c8', borderRadius: '14px' }}>
                  <div className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-3">
                    <div>
                      <span className="badge bg-warning text-dark me-2">Sub-Event #{sIdx + 1}</span>
                      <strong className="text-white h5">{sub.title}</strong>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-sm" style={{border:"1.5px solid #a67c52",color:"#a67c52",background:"transparent"}} onClick={() => {
                        if (isEditing) setEditingSubEventId(null);
                        else startEditSubEvent(sub);
                      }}>{isEditing ? 'Cancel Edit' : 'Edit Sub-Event'}</button>
                      <Link to={`/admin/subevents/${sub._id}/registrations`} className="btn btn-outline-success btn-sm">Regs ({sub.registrationCount || 0})</Link>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteSubEvent(sub._id)}>Delete</button>
                    </div>
                  </div>

                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveEditSubEvent(e, sub._id)} className="mb-4">
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Title *</label>
                          <input type="text" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubTitle} onChange={(e) => setEditSubTitle(e.target.value)} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Description</label>
                          <textarea className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} rows="2" value={editSubDesc} onChange={(e) => setEditSubDesc(e.target.value)} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Day Number</label>
                          <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubDay} onChange={(e) => setEditSubDay(parseInt(e.target.value) || 1)} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Event Date</label>
                          <input type="date" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubDate} onChange={(e) => setEditSubDate(e.target.value)} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Start Time</label>
                          <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubStart} onChange={(e) => setEditSubStart(e.target.value)}>
                            <option value="">— Select —</option>
                            {timeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>End Time</label>
                          <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubEnd} onChange={(e) => setEditSubEnd(e.target.value)}>
                            <option value="">— Select —</option>
                            {timeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Registration Deadline</label>
                          <input type="datetime-local" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubDeadline} onChange={(e) => setEditSubDeadline(e.target.value)} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Max Participants</label>
                          <input type="number" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} placeholder="Unlimited" value={editSubMaxParts} onChange={(e) => setEditSubMaxParts(e.target.value)} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Registration Type</label>
                          <select className="form-select" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubIsGroup ? 'true' : 'false'} onChange={(e) => setEditSubIsGroup(e.target.value === 'true')}>
                            <option value="false">👤 Individual</option>
                            <option value="true">👥 Team / Group</option>
                          </select>
                        </div>
                        {editSubIsGroup && (
                          <>
                            <div className="col-sm-6">
                              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Min Team Size</label>
                              <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubMinTeam} onChange={(e) => setEditSubMinTeam(parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="col-sm-6">
                              <label className="form-label small fw-bold" style={{color:"#a67c52"}}>Max Team Size</label>
                              <input type="number" min="1" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} value={editSubMaxTeam} onChange={(e) => setEditSubMaxTeam(parseInt(e.target.value) || 1)} />
                            </div>
                          </>
                        )}
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold d-block" style={{color:"#a67c52"}}>QR Code Image</label>
                          {sub.qrImage && (
                            <div className="mb-2 position-relative" style={{ display: 'inline-block' }}>
                              <img src={sub.qrImage} alt="QR" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                              <button type="button" className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteSubQr(sub._id)}>Remove QR</button>
                            </div>
                          )}
                          <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} accept="image/*" onChange={(e) => setEditSubQrFile(e.target.files[0])} />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-bold d-block" style={{color:"#a67c52"}}>Poster Image</label>
                          {sub.posterImage && (
                            <div className="mb-2 position-relative" style={{ display: 'inline-block' }}>
                              <img src={sub.posterImage} alt="Poster" style={{ maxHeight: '60px', borderRadius: '4px' }} />
                              <button type="button" className="btn btn-danger btn-sm ms-2" onClick={() => handleDeleteSubPoster(sub._id)}>Remove Poster</button>
                            </div>
                          )}
                          <input type="file" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} accept="image/*" onChange={(e) => setEditSubPosterFile(e.target.files[0])} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold" style={{color:"#a67c52"}}>External Google Forms Link</label>
                          <input type="url" className="form-control" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8",borderRadius:"8px"}} placeholder="https://forms.gle/..." value={editSubExternalLink} onChange={(e) => setEditSubExternalLink(e.target.value)} />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-success btn-sm mt-3">Save Sub-Event Details</button>
                    </form>
                  ) : (
                    <div className="mb-4 small text-muted">
                      <div>Day: {sub.dayNumber || 1} {sub.eventDate && `· Date: ${new Date(sub.eventDate).toLocaleDateString('en-IN')}`}</div>
                      <div>Time: {sub.startTime || 'Not specified'} {sub.endTime && `– ${sub.endTime}`}</div>
                      <div>Registration type: {sub.isGroupEvent ? `Team (Size: ${sub.minTeamSize}-${sub.maxTeamSize})` : 'Individual'}</div>
                      {sub.maxParticipants && <div>Max participants: {sub.maxParticipants} (Registered: {sub.registrationCount})</div>}
                      {sub.externalRegistrationLink && <div>External registration link: <a href={sub.externalRegistrationLink} target="_blank" rel="noopener noreferrer">{sub.externalRegistrationLink}</a></div>}
                    </div>
                  )}

                  {/* Sub-Event Fields Builder */}
                  <div className="p-3 rounded" style={{border:"1px solid #e0d5c8",background:"#f5ede3"}}>
                    <h4 className="h6 fw-bold mb-3 pb-2" style={{color:"#a67c52",borderBottom:"1px solid #e0d5c8"}}>📋 Sub-Event Custom Registration Fields</h4>
                    
                    <div className="d-flex flex-column gap-2 mb-3">
                      {sub.formFields && sub.formFields.length > 0 ? (
                        sub.formFields.map((field) => (
                          <div key={field._id} className="p-2 rounded" style={{border:"1px solid #e0d5c8",background:"#fdfaf6"}}>
                            {editingSubFieldId === field._id ? (
                              <form onSubmit={(e) => handleSaveEditSubField(e, sub._id, field._id)}>
                                <div className="row g-2 mb-2">
                                  <div className="col-12">
                                    <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Field Label" value={editSubFieldLabel} onChange={(e) => setEditSubFieldLabel(e.target.value)} required />
                                  </div>
                                  <div className="col-sm-6">
                                    <select className="form-select form-select-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} value={editSubFieldType} onChange={(e) => setEditSubFieldType(e.target.value)} required>
                                      <option value="text">Short Answer (Text)</option>
                                      <option value="textarea">Paragraph (Textarea)</option>
                                      <option value="dropdown">Dropdown</option>
                                      <option value="checkbox">Checkboxes</option>
                                      <option value="file">File Upload</option>
                                      <option value="date">Date</option>
                                      <option value="time">Time</option>
                                    </select>
                                  </div>
                                  <div className="col-sm-6">
                                    <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Placeholder Hint" value={editSubFieldPlaceholder} onChange={(e) => setEditSubFieldPlaceholder(e.target.value)} />
                                  </div>
                                  {(editSubFieldType === 'dropdown' || editSubFieldType === 'checkbox') && (
                                    <div className="col-12">
                                      <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Options (comma separated: Opt1, Opt2)" value={editSubFieldOptions} onChange={(e) => setEditSubFieldOptions(e.target.value)} required />
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <label className="d-flex align-items-center gap-1 small text-muted">
                                    <input type="checkbox" checked={editSubFieldRequired} onChange={(e) => setEditSubFieldRequired(e.target.checked)} />
                                    Required Field
                                  </label>
                                  <div className="d-flex gap-1">
                                    <button type="submit" className="btn btn-success btn-sm">Save</button>
                                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditingSubFieldId(null)}>Cancel</button>
                                  </div>
                                </div>
                              </form>
                            ) : (
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className="badge bg-secondary me-2">{field.type}</span>
                                  <strong style={{color:"#3a2a1a"}}>{field.label}</strong>
                                  {field.required && <span className="text-danger ms-1">*</span>}
                                  {field.options && (Array.isArray(field.options) ? field.options : []).length > 0 && (
                                    <div className="small text-muted mt-1">Options: {(Array.isArray(field.options) ? field.options : []).join(', ')}</div>
                                  )}
                                </div>
                                <div className="d-flex gap-1">
                                  <button type="button" className="btn btn-sm" style={{border:"1.5px solid #a67c52",color:"#a67c52",background:"transparent"}} onClick={() => startEditSubField(field)}>Edit</button>
                                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteSubField(sub._id, field._id)}>✕</button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small italic">No extra custom fields defined for this sub-event yet.</p>
                      )}
                    </div>

                    {/* Add sub field form */}
                    <form onSubmit={(e) => handleAddSubField(e, sub._id)} className="p-3 rounded" style={{border:"1px solid #e0d5c8",background:"#f5ede3"}}>
                      <h5 className="mb-2 text-warning small fw-bold">➕ Add Sub-Event Field</h5>
                      <div className="row g-2 mb-2">
                        <div className="col-12">
                          <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Field Label (e.g. Github Link, Team Member Names)" value={newSubFieldLabel} onChange={(e) => setNewSubFieldLabel(e.target.value)} required />
                        </div>
                        <div className="col-sm-6">
                          <select className="form-select form-select-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} value={newSubFieldType} onChange={(e) => setNewSubFieldType(e.target.value)} required>
                            <option value="text">Short Answer (Text)</option>
                            <option value="textarea">Paragraph (Textarea)</option>
                            <option value="dropdown">Dropdown</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="file">File Upload</option>
                            <option value="date">Date</option>
                            <option value="time">Time</option>
                          </select>
                        </div>
                        <div className="col-sm-6">
                          <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Placeholder Hint" value={newSubFieldPlaceholder} onChange={(e) => setNewSubFieldPlaceholder(e.target.value)} />
                        </div>
                        {(newSubFieldType === 'dropdown' || newSubFieldType === 'checkbox') && (
                          <div className="col-12">
                            <input type="text" className="form-control form-control-sm" style={{background:"#fff",color:"#3a2a1a",border:"1.5px solid #e0d5c8"}} placeholder="Options (comma separated: Opt1, Opt2)" value={newSubFieldOptions} onChange={(e) => setNewSubFieldOptions(e.target.value)} required />
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <label className="d-flex align-items-center gap-1 small text-muted">
                          <input type="checkbox" checked={newSubFieldRequired} onChange={(e) => setNewSubFieldRequired(e.target.checked)} />
                          Required Field
                        </label>
                        <button type="submit" className="btn btn-sm" style={{background:"#a67c52",border:"1.5px solid #a67c52",color:"#fff"}}>Add Field</button>
                      </div>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
