// import { displayMap } from './mapbox';
/* eslint-disable */
import 'core-js';
import 'regenerator-runtime/runtime';
import { login, logout } from './login';

// DOM ELEMENTS
// const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// DELEGATION
// if(mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations)
//   displayMap(locations)
// }

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);
