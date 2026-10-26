/* Client intake form.
   The two settings below are the only things you should need to edit. */
const CONFIG = {
  // Paste your Formspree form URL here (see SETUP-INTAKE.md). Looks like https://formspree.io/f/abcdwxyz
  formEndpoint: "https://formspree.io/f/xpppqwev",

  // Delivery time shown on the thank-you message.
  deliveryDefault: "3 days",
  deliveryLonger: "5 to 7 days",
  // Packages that take the longer time (names must match the dropdown exactly).
  longerPackages: ["Ultimate Bundle", "Cosmic Roadmap"]
};

(function () {
  const form = document.getElementById("intake");
  const thanks = document.getElementById("thanks");
  const submitBtn = document.getElementById("submit");
  const formError = document.getElementById("form-error");
  const focusError = document.getElementById("focus-error");
  const timeInput = document.getElementById("birth_time");
  const timeUnsure = document.getElementById("time_unsure");
  const timeNoteWrap = document.getElementById("time_note_wrap");
  const timeReq = document.getElementById("time-req");

  // "I'm not sure of my time": time becomes optional and a note field appears.
  timeUnsure.addEventListener("change", function () {
    const unsure = timeUnsure.checked;
    timeInput.disabled = unsure;
    timeInput.required = !unsure;
    if (unsure) timeInput.value = "";
    timeNoteWrap.hidden = !unsure;
    timeReq.hidden = unsure;
  });

  const checkedAreas = function () {
    return form.querySelectorAll('input[name="life_area"]:checked');
  };
  form.querySelectorAll('input[name="life_area"]').forEach(function (cb) {
    cb.addEventListener("change", function () { focusError.hidden = checkedAreas().length > 0; });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;
    form.classList.add("touched");

    // Bots fill the hidden field; pretend success and send nothing.
    if (form.elements["_gotcha"].value) { showThanks(); return; }

    if (checkedAreas().length === 0) {
      focusError.hidden = false;
      document.getElementById("focus-group").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const areas = Array.prototype.map.call(checkedAreas(), function (c) { return c.value; }).join(", ");
    const payload = {
      _subject: "New intake: " + form.elements["full_name"].value + " (" + form.elements["package"].value + ")",
      "Full name": form.elements["full_name"].value.trim(),
      "Facebook name": form.elements["facebook_name"].value.trim(),
      "Package": form.elements["package"].value,
      "Date of birth": form.elements["birth_date"].value,
      "Birth time": timeUnsure.checked ? "NOT SURE" : form.elements["birth_time"].value,
      "Birth time note": timeUnsure.checked ? form.elements["birth_time_note"].value.trim() : "",
      "Birth city": form.elements["birth_city"].value.trim(),
      "Birth country": form.elements["birth_country"].value.trim(),
      "Main question": form.elements["main_question"].value.trim(),
      "Life area focus": areas,
      "Delivery format": form.elements["delivery_format"].value,
      "Details confirmed accurate": "Yes"
    };

    if (CONFIG.formEndpoint.indexOf("YOUR_FORM_ID") !== -1) {
      showError("This form isn’t connected yet. Please finish the setup in SETUP-INTAKE.md.");
      return;
    }

    submitBtn.disabled = true;
    fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      showThanks();
    }).catch(function () {
      submitBtn.disabled = false;
      showError("Sorry, something went wrong and your details were not sent. Please try again, or message Alex on Messenger.");
    });
  });

  function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
    formError.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function showThanks() {
    const first = form.elements["full_name"].value.trim().split(/\s+/)[0];
    if (first) document.getElementById("thanks-name").textContent = first;
    const longer = CONFIG.longerPackages.indexOf(form.elements["package"].value) !== -1;
    document.querySelector("[data-delivery-en]").textContent = longer ? CONFIG.deliveryLonger : CONFIG.deliveryDefault;
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
