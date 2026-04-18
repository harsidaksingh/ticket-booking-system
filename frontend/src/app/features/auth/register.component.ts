import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';



@Component({
    selector:'app-register',
    standalone:true,
    imports: [ReactiveFormsModule],
    template:`
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <input formControlName="name" placeholder="Your Name">
            @if (nameInvalid) {
                <small class="text-danger">Name must be at least 3 characters.</small>
            }
            <input formControlName="email" placeholder="Email">
            @if (emailInvalid) {
                <small class="text-danger">Invalid Email</small>
            }
            <input formControlName="password" type="password" placeholder="Password">
            @if (passwordInvalid) {
                <small class="text-danger">Password must be at least 6 characters.</small>
            }
            <button type="submit" [disabled]="registerForm.invalid">Register</button>
            @if (errorMessage) {
                <div class="alert alert-danger">{{ errorMessage }}</div>
            }
        </form>
    
    `
})
export class RegisterComponent{
    private authService = inject(AuthService);
    private router = inject(Router);
    errorMessage:string= '';
    registerForm = new FormGroup({
        name: new FormControl('',[Validators.required,Validators.minLength(3)]),
        email: new FormControl('',[Validators.required,Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
    onSubmit(){
        if(this.registerForm.valid){
            const {name,email,password}= this.registerForm.value as {name:string,email:string,password:string};
            this.authService.register(name,email,password).subscribe({
               next:()=>{
                    this.router.navigate(['/login'])
               },
               error:(err:string)=>{
                    console.error('Unable to Login',err);
                    this.errorMessage = 'Email Already present'
               } 
            })
        }
    }
    get nameInvalid(){
        const ctrl = this.registerForm.get('name');
        return ctrl?.invalid && ctrl?.touched;
    }
    get emailInvalid(){
        const ctrl = this.registerForm.get('email');
        return ctrl?.invalid && ctrl?.touched;
    }
    get passwordInvalid(){
        const ctrl = this.registerForm.get('password');
        return ctrl?.invalid && ctrl?.touched;
    }
}
    
