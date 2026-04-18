import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  exports: [CommonModule]   // Re-export CommonModule so any module that 
                            // imports SharedModule gets CommonModule too
})
export class SharedModule {}
