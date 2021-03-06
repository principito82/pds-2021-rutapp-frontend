/* eslint-disable @typescript-eslint/dot-notation */
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController, NavController, Platform, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import firebase from 'firebase/app';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})

export class RegistroPage implements OnInit {
  formularioDeRegistro: FormGroup;
  errorRegistro = {};

  constructor(
    private nav: NavController,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private menu: MenuController,
    private afAuth: AngularFireAuth,
    private userService: UsuarioService,
    private toastController: ToastController,
    //plugin
    private platform: Platform,
    private googlePlus: GooglePlus
  ) {
  }
  ngOnInit(): void {
    this.formularioDeRegistro = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    this.menu.enable(false);
  }
  // Registrarse e ir a login
  async register() {
    //Verifico que los campos estén llenos
    this.errorRegistro = this.validarForm(this.formularioDeRegistro);
    //verifico que no haya ningún error en el formulario
    if (Object.keys(this.errorRegistro).length) {
      const alert = await this.alertController.create({
        header: 'Faltan completar campos',
        buttons: ['OK'],
      });
      return await alert.present();
    };
    const loading = await this.loadingController.create({ message: 'Cargando datos...' });
    await loading.present();

    const usuario = {
      idUsuario: null,
      nombre: this.formularioDeRegistro.value.nombre,
      apellido: this.formularioDeRegistro.value.apellido,
      username: this.formularioDeRegistro.value.nombre,
      password: this.formularioDeRegistro.value.password,
      email: this.formularioDeRegistro.value.email,
      activo: true,
    };
    this.userService.registrarUsuario(usuario)
      .then(async () => {
        await loading.dismiss();
        this.presentToast('Usuario registrado correctamente!');
        this.irAlogin();
      }
      )
      .catch(async (e) => {
        console.error(e);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Falló el registro',
          buttons: ['OK'],
        });

        await alert.present();
      });
    // this.userService.registrarUsuario(usuario)
    //   .then(() => {
    //     this.presentToast('Usuario registrado correctamente');
    //     this.irAlogin();
    //   }
    //   )
    //   .catch(e => console.error(e));
  }

  // Ir a login
  irAlogin() {
    this.router.navigateByUrl('login', { replaceUrl: true });
  }

  async registroConGoogle() {
    console.log('Registro con google');
    // await this.registroConGoogleOFacebook(new firebase.auth.GoogleAuthProvider());
    if (this.platform.is('android')) {
      // this.loginGoogleAndroid();
      console.log('es android');
      const res = await this.googlePlus.login({
        webClientId: '102831843420-mb43t9qjnv5akqq04elk2ffi9ggov2jr.apps.googleusercontent.com',
        offline: true
      });
      await this.registroConGoogleOFacebook(firebase.auth.GoogleAuthProvider.credential(res.idToken));
    } else {
      console.log('es web');
      // this.loginGoogleWeb();
      await this.registroConGoogleOFacebook(new firebase.auth.GoogleAuthProvider());
    }

  }

  async registroConFacebook() {
    console.log('Registro con facebook');
    await this.registroConGoogleOFacebook(new firebase.auth.FacebookAuthProvider());
  }

  async registroConGoogleOFacebook(proveedorDeDatos) {


    const loading = await this.loadingController.create({ message: 'Cargando datos...' });
    await loading.present();
    let resDeFirebase;
    try {
      if (this.platform.is('android')) {
        resDeFirebase = await this.afAuth.signInWithCredential(proveedorDeDatos);
        // resDeFirebase = await this.afAuth.signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken));
      } else {
        resDeFirebase = await this.afAuth.signInWithPopup(proveedorDeDatos);
      }
    } catch (err) {
      this.presentToast(err);
    }
    //Traigo los datos de firebase
    // this.afAuth.signInWithPopup(proveedorDeDatos)
    console.log(resDeFirebase);
    
    const user = resDeFirebase.user;
    console.log(user);

    const usuario = {
      idUsuario: null,
      nombre: user.displayName.split(' ')[0],
      apellido: user.displayName.split(' ')[1],
      username: user.displayName.split(' ')[0],
      password: user.uid,
      email: user.email,
      activo: true,
      // telefono: user.phoneNumber,
      // foto: user.photoURL,
    };//);
    // Registro al usuario
    this.userService.registrarUsuario(usuario)
      .then(async () => {
        await loading.dismiss();
        this.presentToast('Usuario registrado correctamente!');
        this.irAlogin();
      })
      .catch(async (e) => {
        console.error(e);
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Falló el registro',
          buttons: ['OK'],
        });

        await alert.present();
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
    });
    toast.present();
  }

  handlerChange(evento: any): void {
    // const { name, value } = evento.target;
    this.errorRegistro = this.validarForm(this.formularioDeRegistro);
  }

  validarForm(credencial: any) {
    const errors = {};//{username:'', password:''};

    if (!credencial.value.nombre) {
      errors['nombre'] = 'El nombre es requerido';
    }

    if (!credencial.value.apellido) {
      errors['apellido'] = 'El apellido es requerido';
    }
    // else if (!this.validateEmail(credencial.value.username)) {
    //   errors['username'] = 'El username es invalido';
    // }

    if (!credencial.value.email) {
      errors['email'] = 'El email es requerido';
    } else if (!this.validateEmail(credencial.value.email)) {
      errors['email'] = 'El email es invalido';
    }

    if (!credencial.value.password) {
      errors['password'] = 'El password es requerido';
    } else if (!this.validarPassword(credencial.value.password)) {
      errors['password'] = 'El password es invalido';
    }

    console.log('error: ', errors);
    return errors;
  }

  validateEmail(email: string): boolean {
    // eslint-disable-next-line max-len
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  }

  validarPassword(password: string): boolean {
    // Contain at least 8 characters
    // contain at least 1 number
    // contain at least 1 lowercase character (a-z)
    // contain at least 1 uppercase character (A-Z)
    // contains only 0-9a-zA-Z
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return regex.test(String(password));
  }
}
