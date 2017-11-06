import { ThingsApp } from './thingsapp';
import * as bootstrap from 'bootstrap';
import * as $ from 'jquery';

(<any> window).things = new ThingsApp();

console.log("Loaded things app");

(<any> window).things.init();