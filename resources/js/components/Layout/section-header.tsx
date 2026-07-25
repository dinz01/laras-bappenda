interface SectionHeaderProps {
    title: string;
    description: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
    return (
        <div className="mb-4 space-y-1 border-b border-border/40 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
            </h2>
            <p className="text-xs text-muted-foreground">{description}</p>
        </div>
    );
}
