document.addEventListener('DOMContentLoaded', function() {
    var navTrigger = document.querySelector('.nav-trigger');
    var nav = document.querySelector('nav ul');

    navTrigger.addEventListener('click', function() {
        // This will toggle the 'collapsed' class on and off.
        nav.classList.toggle('collapsed');
    });
});
