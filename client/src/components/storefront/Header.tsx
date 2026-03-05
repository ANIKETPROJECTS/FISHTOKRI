import { Link } from "wouter";
import { ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import logoImg from "@assets/image_1772715110268.png";

export function Header({ onSearch }: { onSearch?: (query: string) => void }) {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img src={logoImg} alt="FishTokri Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          <span className="text-xl sm:text-2xl font-display font-medium text-foreground">
            Fish<span className="text-accent">Tokri</span>
          </span>
        </Link>

        {onSearch && (
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for fresh seafood..."
              className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent/10 rounded-full">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </Link>
          
          <Button
            onClick={() => setIsCartOpen(true)}
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-accent/10 rounded-full"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-md animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>
      {onSearch && (
        <div className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for fresh seafood..."
              className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 h-9"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
