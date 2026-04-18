import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-seat-map',
  standalone: true,
  template: `
    <div class="container mt-4">
      <h2>Select Your Seats</h2>
      
      <div class="d-flex flex-wrap gap-2 my-3">
        @for (seat of seats(); track seat.id) {
          <button 
            class="btn"
            [class.btn-success]="!seat.selected"
            [class.btn-warning]="seat.selected"
            (click)="toggleSeat(seat.id)">
            {{ seat.id }}
          </button>
        }
        <button [disabled] = "selectedCount() === 0" (click) = "clearSeat()">Clear Selection</button>  
      </div>
      <div>
        @if(seatLimit){
            <p class="text-danger">Maximum 3 seats allowed </p>
        }  
      </div>

      <div class="mt-3">
        <p>Selected: <strong>{{ selectedCount() }}</strong> seats</p>
        <p>Total Cost: <strong>₹{{ totalCost() }}</strong></p>
      </div>
    </div>
  `
})
export class SeatMapComponent {
  // A Signal holding an array of seat objects
  seats = signal([
    { id: 1, selected: false, price: 500 },
    { id: 2, selected: false, price: 500 },
    { id: 3, selected: false, price: 500 },
    { id: 4, selected: false, price: 750 },
    { id: 5, selected: false, price: 750 },
    { id: 6, selected: false, price: 1000 },
  ]);
  // A Computed Signal: automatically recalculates when seats() changes
  selectedCount = computed(() => 
    this.seats().filter(s => s.selected).length
);
  seatLimit: boolean = false;


  // Another Computed Signal
  totalCost = computed(() => 
    this.seats().filter(s => s.selected).reduce((sum, s) => sum + s.price, 0)
  );

  // Method to toggle a seat's selection
  toggleSeat(id: number) {
    const clickedSeat = this.seats().find(seat => seat.id === id);
    if(this.selectedCount() >= 3 && !clickedSeat?.selected){
        this.seatLimit=true;
        return;
    }
        this.seatLimit = false;
        this.seats.update(currentSeats => 
        currentSeats.map(seat => 
            seat.id === id ? { ...seat, selected: !seat.selected } : seat
        )
        );
    
  }
  clearSeat(){
    this.seats.update(currentSeats => currentSeats.map(seat=> ({...seat,selected:false})))
  }
}
