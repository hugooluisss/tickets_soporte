import { TestBed } from '@angular/core/testing';
import { IconComponent, IconName } from './icon.component';

describe('IconComponent', () => {
  it('renders an inline SVG for every supported icon name', () => {
    const names: IconName[] = ['tickets', 'projects', 'categories', 'dashboard', 'reports', 'profile', 'administration', 'logout', 'total-tickets', 'client-replies', 'staff-replies', 'no-reply'];
    for (const name of names) {
      TestBed.configureTestingModule({ imports: [IconComponent] });
      const fixture = TestBed.createComponent(IconComponent);
      fixture.componentRef.setInput('name', name);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('svg')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('svg')?.children.length).toBeGreaterThan(0);
      fixture.destroy();
      TestBed.resetTestingModule();
    }
  });
});
