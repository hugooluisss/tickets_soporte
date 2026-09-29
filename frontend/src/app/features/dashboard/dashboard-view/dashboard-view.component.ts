import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { TranslationService } from '../../../core/i18n/translation.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { DashboardSummary } from '../../models';
import { DashboardService } from '../dashboard.service';
import { priorityDonut, replyChartArea, replyChartPolyline, trendBarHeights } from '../dashboard-charts';
import { replyChartPoints as getReplyChartPoints } from '../dashboard-charts';

@Component({ selector: 'app-dashboard-view', standalone: true, imports: [TranslatePipe, IconComponent, RouterLink], templateUrl: './dashboard-view.component.html', styleUrl: './dashboard-view.component.css' })
export class DashboardView {
  private readonly translations = inject(TranslationService);
  readonly data = signal<DashboardSummary | null>(null);
  readonly error = signal('');
  readonly replies = computed(() => this.data()?.replyTimeSeries ?? []);
  readonly replyValues = computed(() => this.replies().map(row => row.count));
  readonly replyLine = computed(() => replyChartPolyline(this.replyValues()));
  readonly replyArea = computed(() => replyChartArea(this.replyValues()));
  readonly replyPoints = computed(() => getReplyChartPoints(this.replyValues()));
  readonly donut = computed(() => priorityDonut(this.data()?.byPriority ?? []));
  readonly trend = computed(() => trendBarHeights(this.data()?.ticketsTrend ?? []));
  readonly dateLabel = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  constructor() { inject(DashboardService).summary().subscribe({ next: value => this.data.set(value), error: () => this.error.set(this.translations.t('dashboard.loadError')) }); }
}
