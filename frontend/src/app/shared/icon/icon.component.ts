import { Component, input } from '@angular/core';

export type IconName = 'tickets' | 'projects' | 'categories' | 'dashboard' | 'reports' | 'profile' | 'administration' | 'logout' | 'total-tickets' | 'client-replies' | 'staff-replies' | 'no-reply';

@Component({ selector: 'app-icon', standalone: true, template: `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="icon">
  @switch (name()) {
    @case ('tickets') { <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/> }
    @case ('projects') { <path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h7l2 2"/> }
    @case ('categories') { <path d="M4 5h16v4H4zM4 11h7v8H4zM13 11h7v8h-7z"/> }
    @case ('dashboard') { <path d="M4 19V5M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/> }
    @case ('reports') { <path d="M5 3h10l4 4v14H5z"/><path d="M14 3v5h5M8 12h8M8 16h8"/> }
    @case ('profile') { <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/> }
    @case ('administration') { <path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7z"/><path d="m9 12 2 2 4-4"/> }
    @case ('logout') { <path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7v18h-7"/> }
    @case ('total-tickets') { <rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/> }
    @case ('client-replies') { <path d="M4 5h16v12H9l-5 4z"/><path d="M8 9h8M8 13h5"/> }
    @case ('staff-replies') { <path d="M20 5H4v12h11l5 4z"/><path d="M8 9h8M11 13h5"/> }
    @case ('no-reply') { <circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 5.5 1.5c0 2-2.5 2-2.5 4M12 18h.01"/> }
  }
</svg>`, styles: [`.icon{display:block;width:1.25rem;height:1.25rem}`] })
export class IconComponent { readonly name = input.required<IconName>(); }
