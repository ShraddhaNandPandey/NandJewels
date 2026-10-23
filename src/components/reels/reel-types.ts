import type { Reel, Product } from "@/lib/types";

export interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onSelect: (reel: Reel) => void;
  onShopLook: (reel: Reel) => void;
}

export interface ReelViewerProps {
  reel: Reel | null;
  onClose: () => void;
  onNavigateProduct: (productId: string) => void;
}

export interface ReelProductItemProps {
  product: Product;
  onSelect: (productId: string) => void;
}
