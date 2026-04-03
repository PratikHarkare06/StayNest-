// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// Share Listing Function
function shareListing() {
  if (navigator.share) {
    navigator
      .share({
        title: document.title,
        text: "Check out this amazing place I found on StayNest!",
        url: window.location.href,
      })
      .then(() => console.log("Successful share"))
      .catch((error) => console.log("Error sharing", error));
  } else {
    // Fallback
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
    // Ideally use a Bootstrap Toast here for better UI
  }
}
