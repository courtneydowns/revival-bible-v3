import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';

export default function TagEditor({ entityId, entityType, tags = [] }) {
  const [tagValue, setTagValue] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const canonTags = useRevivalStore((state) => state.canonTags);
  const addTagToEntity = useRevivalStore((state) => state.addTagToEntity);
  const removeTagFromEntity = useRevivalStore((state) => state.removeTagFromEntity);
  const assignedSlugs = useMemo(() => new Set(tags.map((tag) => tag.slug)), [tags]);
  const availableTags = useMemo(
    () => canonTags.filter((tag) => !assignedSlugs.has(tag.slug)),
    [assignedSlugs, canonTags]
  );

  const addTag = async (event) => {
    event.preventDefault();
    const nextTag = tagValue.trim();
    if (!nextTag || saving) return;
    if (assignedSlugs.has(normalizeTagSlug(nextTag))) {
      setMessage('Tag is already assigned.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const response = await addTagToEntity({ entityType, entityId, tag: nextTag });
      if (response?.ok) {
        setTagValue('');
      } else {
        setMessage(response?.message || 'Tag was not added.');
      }
    } catch (error) {
      setMessage(error?.message || 'Tag was not added.');
    } finally {
      setSaving(false);
    }
  };

  const removeTag = async (tagSlug) => {
    if (saving) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await removeTagFromEntity({ entityType, entityId, tagSlug });
      if (!response?.ok) {
        setMessage(response?.message || 'Tag was not removed.');
      }
    } catch (error) {
      setMessage(error?.message || 'Tag was not removed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="inspector-editor" aria-label="Tag editor">
      <div className="inspector-editor-header">
        <span>Tags</span>
      </div>
      <div className="editable-tag-row">
        {tags.length ? tags.map((tag) => (
          <span className={`canon-tag editable color-${tag.color || 'default'}`} key={tag.slug} title={tag.description || tag.label}>
            {tag.label}
            <button aria-label={`Remove ${tag.label}`} disabled={saving} onClick={() => removeTag(tag.slug)} title={`Remove ${tag.label}`} type="button">
              <X size={12} />
            </button>
          </span>
        )) : <span className="muted small-note">No tags assigned.</span>}
      </div>
      <form className="tag-add-row" onSubmit={addTag}>
        <input
          disabled={saving}
          list={`tag-options-${entityType}-${entityId}`}
          onChange={(event) => setTagValue(event.target.value)}
          placeholder="Add tag"
          value={tagValue}
        />
        <datalist id={`tag-options-${entityType}-${entityId}`}>
          {availableTags.map((tag) => (
            <option key={tag.slug} value={tag.slug}>{tag.label}</option>
          ))}
        </datalist>
        <button className="icon-button" disabled={saving || !tagValue.trim()} title="Add tag" type="submit">
          <Plus size={15} />
        </button>
      </form>
      {message ? <p className="editor-message">{message}</p> : null}
    </section>
  );
}

function normalizeTagSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
