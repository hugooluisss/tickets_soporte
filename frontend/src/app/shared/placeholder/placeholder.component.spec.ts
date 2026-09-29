import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { PlaceholderComponent } from './placeholder.component';

describe('PlaceholderComponent', () => {
  it('shows the route title', () => {
    TestBed.configureTestingModule({ imports: [PlaceholderComponent], providers: [{ provide: ActivatedRoute, useValue: { snapshot: { data: { title: 'Tickets' } } } }] });
    const fixture = TestBed.createComponent(PlaceholderComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tickets');
  });
});
