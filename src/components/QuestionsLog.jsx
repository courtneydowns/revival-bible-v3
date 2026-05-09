import { useRevivalStore } from '../store.js';
import PlaceholderView from './PlaceholderView.jsx';

export default function QuestionsLog() {
  const questions = useRevivalStore((state) => state.questions);

  return (
    <PlaceholderView title="Questions Log">
      Question urgency tiers are represented in the schema. Phase 1 has {questions.length} questions.
    </PlaceholderView>
  );
}
