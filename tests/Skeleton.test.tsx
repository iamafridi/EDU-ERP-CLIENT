import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton, TableSkeleton, KPICardSkeleton } from '@/components/ui/Skeleton';

describe('Skeleton Components', () => {
    it('renders base Skeleton with default classes', () => {
        const { container } = render(<Skeleton />);
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('animate-pulse');
        expect(el.className).toContain('bg-slate-200');
    });

    it('renders Skeleton with custom className', () => {
        const { container } = render(<Skeleton className="h-10 w-48" />);
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('h-10');
        expect(el.className).toContain('w-48');
    });

    it('renders TableSkeleton', () => {
        const { container } = render(<TableSkeleton rows={3} cols={4} />);
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders KPICardSkeleton', () => {
        const { container } = render(<KPICardSkeleton />);
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });
});
