// script.js
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const slider = document.querySelector('.slider');

function changeSlide(direction) {
    currentSlide += direction;

    if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    } else if (currentSlide >= slides.length) {
        currentSlide = 0;
    }

    const offset = -currentSlide * 100;
    slider.style.transform = `translateX(${offset}%)`;
}

// Initialize the slider
changeSlide(0);

<script>
    var stripe = Stripe('YOUR_PUBLISHABLE_KEY');
    var elements = stripe.elements();
    var form = document.getElementById('donation-form');
    var card = elements.create('card');
    card.mount('#card-element');
    var displayError = document.getElementById('card-errors');
  
    form.addEventListener('submit', function(event) {
        event.preventDefault();
  
        stripe.createToken(card).then(function(result) {
            if (result.error) {
                displayError.textContent = result.error.message;
            } else {
                stripeTokenHandler(result.token);
            }
        });
    });
  
    function stripeTokenHandler(token) {
        // Send the token to your server for processing.
        // You would make an AJAX request to your server here to complete the donation.
    }
</script>
