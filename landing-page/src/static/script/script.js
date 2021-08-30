// window.onload = function () {
//   var sliderElement = document.getElementById('my-keen-slider');
//   var carousel = document.getElementById('carousel');
//   var interval = 0;
//   function autoplay(run) {
//     clearInterval(interval);
//     interval = setInterval(() => {
//       if (run && slider) {
//         slider.next();
//       }
//     }, 5000);
//   }

//   var slider = new KeenSlider('#my-keen-slider', {
//     loop: true,
//     duration: 1000,
//     dragStart: () => {
//       autoplay(false);
//     },
//     dragEnd: () => {
//       autoplay(true);
//     },
//     created: function (instance) {
//       document.getElementById('arrow-left').addEventListener('click', function () {
//         instance.prev();
//       });

//       document.getElementById('arrow-right').addEventListener('click', function () {
//         instance.next();
//       });
//       var dots_wrapper = document.getElementById('dots');
//       var slides = document.querySelectorAll('.keen-slider__slide');
//       slides.forEach(function (t, idx) {
//         var dot = document.createElement('button');
//         dot.classList.add('dot');
//         dots_wrapper.appendChild(dot);
//         dot.addEventListener('click', function () {
//           instance.moveToSlide(idx);
//         });
//       });
//       updateClasses(instance);
//     },
//     slideChanged(instance) {
//       updateClasses(instance);
//     },
//   });

//   carousel.addEventListener('mouseover', () => {
//     autoplay(false);
//   });
//   carousel.addEventListener('mouseout', () => {
//     autoplay(true);
//   });
//   autoplay(true);

//   function updateClasses(instance) {
//     var slide = instance.details().relativeSlide;
//     // var arrowLeft = document.getElementById("arrow-left")
//     // var arrowRight = document.getElementById("arrow-right")
//     // slide === 0
//     //   ? arrowLeft.classList.add("arrow--disabled")
//     //   : arrowLeft.classList.remove("arrow--disabled")
//     // slide === instance.details().size - 1
//     //   ? arrowRight.classList.add("arrow--disabled")
//     //   : arrowRight.classList.remove("arrow--disabled")

//     var dots = document.querySelectorAll('.dot');
//     dots.forEach(function (dot, idx) {
//       idx === slide ? dot.classList.add('dot--active') : dot.classList.remove('dot--active');
//     });
//   }
// };

// trigger reloads when navigating to a page from history - fixes Chrome behavior
// of caching back navigation which breaks our dual-page app stuff
var landingPages = ['thankyou', 'privacy-policy', 'terms-of-service'];
window.addEventListener('popstate', function () {
  if (landingPages.includes(window.location.pathname)) return;
  window.location.reload();
});
