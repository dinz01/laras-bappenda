import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBoxProps {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

export function SearchBox({ value, placeholder = 'Cari...', onChange }: SearchBoxProps) {
    return (
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="pl-9 pr-9 border-border/60 focus-visible:ring-1"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
