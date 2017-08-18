import { ThingsApp } from './thingsapp';
import * as bootstrap from 'bootstrap';
import * as $ from 'jquery';

(<any> window).things = new ThingsApp();

$("#game-id").keyup((event) => {
    if (event.keyCode == 13) {
        $("#join-btn").click();
    }
});