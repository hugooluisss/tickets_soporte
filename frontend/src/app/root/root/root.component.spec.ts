import { TestBed } from '@angular/core/testing';
import { RootComponent } from './root.component';

describe('RootComponent', () => {
  it('creates the router host', () => {
    TestBed.configureTestingModule({ imports: [RootComponent] });
    expect(TestBed.createComponent(RootComponent).componentInstance).toBeTruthy();
  });
});
