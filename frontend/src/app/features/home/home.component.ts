import { Component, inject, OnInit } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { TicketEvent } from '../../core/models/event.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row mt-4">
      <div class="col-12 text-center mb-4">
        <h1 class="text-primary fw-bold">Welcome to TicketX!</h1>
        <p class="lead">Book tickets for your favorite events instantly.</p>
      </div>

      <!-- @for is Angular's way of looping through an array in HTML -->
      @if (errorMessage) {
        <div class="alert alert-danger">{{ errorMessage }}</div>
      }
      @if (isLoading) {
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col">
            <div class="card h-100 p-3">
              <div
                class="skeleton"
                style="height:150px; margin-bottom:15px"
              ></div>
            </div>
          </div>
          <div class="col">
            <div class="card h-100 p-3">
              <div
                class="skeleton"
                style="height:150px; margin-bottom:15px"
              ></div>
            </div>
          </div>
          <div class="col">
            <div class="card h-100 p-3">
              <div
                class="skeleton"
                style="height:150px; margin-bottom:15px"
              ></div>
            </div>
          </div>
        </div>
      } @else {
        @for (event of events; track event.id) {
          <div class="col-md-4 mb-3">
            <div
              [routerLink]="['/events', event.id]"
              style="cursor:pointer;"
              class="card shadow-sm"
            >
              <div class="card-body d-flex flex-column pb-5">
                <h5 class="card-title fw-bold mb-3">{{ event.name }}</h5>
                <div class="mb-4">
                  <span
                    class="badge rounded-pill bg-secondary text-light px-3 py-2"
                    >🎫 {{ event.totalSeats }} Total Seats</span
                  >
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12 text-center">
            <p class="text-muted">No events available right now.</p>
          </div>
        }
      }
    </div>
  `,
})
export class HomeComponent implements OnInit {
  // Inject our service (just like we injected HttpClient inside the service!)
  private eventService = inject(EventService);
  isLoading: boolean = true;
  errorMessage: string = '';
  // This array will hold the events we get from the backend
  events: TicketEvent[] = [];

  // ngOnInit runs automatically when Angular first displays this component
  ngOnInit() {
    this.eventService.getEvents().subscribe({
      next: (data) => {
        this.events = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch events:', err);
        this.errorMessage = 'Something went wrong. Please try again later.';
        this.isLoading = false;
      },
    });
  }
}
