import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { TicketSeat } from '../../core/models/seat.model';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-eventDetail',
  standalone: true,
  template: `
    @if (isLoading) {
      <p class="text-center">Loading Events...</p>
    } @else {
      <div class="d-flex flex-wrap gap-2">
        @for (seat of seats; track seat.id) {
          <button
            class="btn "
            [class.btn-danger]="seat.status === 1 || seat.status === 2"
            [class.btn-warning]="seat.id === selectedSeatId()"
            [class.btn-success]="
              seat.status === 0 && seat.id !== selectedSeatId()
            "
            [disabled]="seat.status === 1"
            (click)="selectSeat(seat.id)"
          >
            Seat ID: {{ seat.id }}
          </button>
        }
      </div>
      <button
        class="btn btn-primary mt-2"
        [disabled]="selectedSeatId() === null"
        (click)="reserve()"
      >
        Reserve Seat
      </button>
    }
  `,
})
export class EventDetailComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private router = inject(Router);
  isLoading: boolean = true;
  seats: TicketSeat[] = [];
  selectedSeatId = signal<number | null>(null);
  ngOnInit() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    this.eventService.getSeats(Number(id)).subscribe({
      next: (data) => {
        this.seats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
        this.isLoading = false;
      },
    });
  }
  selectSeat(id: number) {
    if (this.selectedSeatId() === id) {
      this.selectedSeatId.set(null);
    } else {
      this.selectedSeatId.set(id);
    }
  }
  reserve() {
    const eventId = this.activatedRoute.snapshot.paramMap.get('id');
    const userEmail: string = localStorage.getItem('userEmail')!;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingService
      .reserve(Number(eventId), Number(this.selectedSeatId()!), userEmail)
      .subscribe({
        next: (data) => {
          this.router.navigate(['/checkout'], {
            state: { eventId: eventId, seatId: this.selectedSeatId() },
          });
        },
        error: (error) => {
          console.error('Failed to reserve seat:', error);
        },
      });
  }
}
