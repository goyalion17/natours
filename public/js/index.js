// import { displayMap } from './mapbox';
/* eslint-disable */
import 'core-js';
import 'regenerator-runtime/runtime';
import { login } from './login';

// DOM ELEMENTS
// const mapBox = document.getElementById('map')

// DELEGATION
// if(mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations)
//   displayMap(locations)
// }

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
