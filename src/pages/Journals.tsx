import React from 'react';
import { Journal } from '../types';
import { JournalShelf } from '../components/JournalShelf';

interface JournalsProps {
  journals: Journal[];
  onTogglePin: (id: string) => void;
  onFilterByJournal: (journalName: string) => void;
}

export const Journals: React.FC<JournalsProps> = ({
  journals,
  onTogglePin,
  onFilterByJournal,
}) => {
  return (
    <div className="space-y-6">
      <JournalShelf
        journals={journals}
        onTogglePin={onTogglePin}
        onFilterByJournal={onFilterByJournal}
      />
    </div>
  );
};
