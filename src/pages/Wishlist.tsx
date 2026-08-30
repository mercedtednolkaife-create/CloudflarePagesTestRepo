import React from 'react';
import { WishlistItem } from '../types';
import { WishlistSection } from '../components/WishlistSection';

interface WishlistProps {
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'submittedAt' | 'votes' | 'status'>) => Promise<boolean>;
  onVoteWishlistItem: (id: string) => void;
  isLoading?: boolean;
}

export const Wishlist: React.FC<WishlistProps> = ({
  wishlist,
  onAddWishlistItem,
  onVoteWishlistItem,
  isLoading = false,
}) => {
  return (
    <div className="space-y-6">
      <WishlistSection
        wishlist={wishlist}
        onAddWishlistItem={onAddWishlistItem}
        onVoteWishlistItem={onVoteWishlistItem}
        isLoading={isLoading}
      />
    </div>
  );
};
