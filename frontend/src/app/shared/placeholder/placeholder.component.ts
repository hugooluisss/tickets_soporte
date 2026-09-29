import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ selector: 'app-placeholder', templateUrl: './placeholder.component.html', styleUrl: './placeholder.component.css' })
export class PlaceholderComponent {
  readonly title = inject(ActivatedRoute).snapshot.data['title'] as string;
}
