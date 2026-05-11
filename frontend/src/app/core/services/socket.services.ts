import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket = io('http://localhost:3000', {
    withCredentials: true,
  });
  joinEvent(eventId: number) {
    this.socket.emit('joinEvent', eventId);
  }
  onSeatUpdate(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('seatUpdate', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.off('seatUpdate');
      };
    });
  }
  leaveEvent(eventId: number) {
    this.socket.emit('leaveEvent', eventId);
  }
}
