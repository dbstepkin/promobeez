(function () {
  const SCROLL_MS = 32000;
  const steps = document.querySelectorAll(".business-step");
  const scrollElement = document.getElementById("businessAnalysisScroll");

  if (!steps.length) return;

  let activeStep = 0;
  let cycleTimer = null;

  function setStep(index) {
    activeStep = index;
    steps.forEach((step, currentIndex) => {
      const isActive = currentIndex === index;
      step.classList.toggle("is-on", isActive);
      step.setAttribute("aria-current", isActive ? "step" : "false");
    });

    if (scrollElement) {
      scrollElement.style.animationPlayState = "running";
    }
  }

  function startCycle() {
    clearInterval(cycleTimer);
    cycleTimer = setInterval(() => {
      const nextStep = (activeStep + 1) % steps.length;
      setStep(nextStep);
    }, SCROLL_MS / steps.length);
  }

  steps.forEach((step, index) => {
    step.style.cursor = "pointer";
    step.addEventListener("click", () => {
      setStep(index);
      startCycle();
    });
  });

  setStep(0);
  startCycle();
})();
