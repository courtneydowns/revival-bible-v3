import { useRevivalStore } from '../store.js';
import PlaceholderView from './PlaceholderView.jsx';

export default function CharacterWorkspace() {
  const characters = useRevivalStore((state) => state.characters);

  return (
    <PlaceholderView title="Character Workspace">
      Character schema and IPC are connected. Phase 1 has {characters.length} character rows.
    </PlaceholderView>
  );
}
