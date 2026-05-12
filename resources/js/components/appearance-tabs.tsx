import { Monitor, Moon, Sun } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppearance } from '@/hooks/use-appearance';
import type { Appearance } from '@/hooks/use-appearance';

const appearanceOptions: {
    value: Appearance;
    label: string;
    icon: typeof Sun;
}[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <ToggleGroup
            type="single"
            value={appearance}
            variant="outline"
            onValueChange={(value) => {
                if (value) {
                    updateAppearance(value as Appearance);
                }
            }}
            className="inline-flex"
        >
            {appearanceOptions.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem
                    key={value}
                    value={value}
                    aria-label={label}
                    className="gap-2 px-4"
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    );
}
