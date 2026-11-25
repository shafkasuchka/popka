(function () {
  "use strict";

  const MAX_FILE_MB = 10;
  const form = document.getElementById("supplier-form");
  const statusEl = document.getElementById("form-status");
  const fileInput = document.getElementById("file");
  const fileNameEl = document.getElementById("file-name");

  if (!form) return;

  const phoneInput = document.getElementById("phone");

  function formatPhone(raw) {
    let digits = raw.replace(/\D/g, "");

    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(1, 11); 
    let out = "+7";
    if (digits.length > 0) out += " (" + digits.slice(0, 3);
    if (digits.length >= 3) out += ")";
    if (digits.length > 3) out += " " + digits.slice(3, 6);
    if (digits.length > 6) out += "-" + digits.slice(6, 8);
    if (digits.length > 8) out += "-" + digits.slice(8, 10);
    return out;
  }

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value) phoneInput.value = "+7 (";
  });

  phoneInput.addEventListener("blur", () => {
    if (phoneInput.value === "+7 (") phoneInput.value = "";
  });

  const rules = {
    company: {
      test: (v) => v.trim().length >= 2,
      message: "Укажите название организации",
    },
    contact: {
      test: (v) => v.trim().length >= 2,
      message: "Укажите имя контактного лица",
    },
    phone: {
      test: (v) => v.replace(/\D/g, "").length === 11,
      message: "Введите телефон полностью: +7 (___) ___-__-__",
    },
    email: {
      test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
      message: "Введите корректную электронную почту",
    },
    material: {
      test: (v) => v.trim().length >= 2,
      message: "Укажите название и марку материала",
    },
    offer: {
      test: (v) => v.trim().length >= 10,
      message: "Опишите предложение подробнее (от 10 символов)",
    },
  };

  function getFieldWrapper(input) {
    return input.closest(".field");
  }

  function validateField(input) {
    const rule = rules[input.name];
    if (!rule) return true;

    const wrapper = getFieldWrapper(input);
    const errorEl = wrapper.querySelector(".field__error");
    const ok = rule.test(input.value);

    wrapper.classList.toggle("is-invalid", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    errorEl.textContent = ok ? "" : rule.message;
    return ok;
  }

  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;

    input.addEventListener("blur", () => {
      if (input.value.length) validateField(input);
    });

    input.addEventListener("input", () => {
      if (getFieldWrapper(input).classList.contains("is-invalid")) {
        validateField(input);
      }
    });
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) {
      fileNameEl.textContent = "";
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      fileInput.value = "";
      fileNameEl.textContent = "";
      setStatus(`Файл больше ${MAX_FILE_MB} МБ. Выберите другой.`, "error");
      return;
    }

    fileNameEl.textContent = "Выбран файл: " + file.name;
    setStatus("", "");
  });

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-ok", type === "ok");
    statusEl.classList.toggle("is-error", type === "error");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    setStatus("", "");

    let firstInvalid = null;
    Object.keys(rules).forEach((name) => {
      const input = form.elements[name];
      const ok = validateField(input);
      if (!ok && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Проверьте заполнение обязательных полей.", "error");
      return;
    }

    const submitBtn = form.querySelector(".btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка…";

    const data = new FormData(form);

    sendProposal(data)
      .then(() => {
        form.reset();
        fileNameEl.textContent = "";
        setStatus("Спасибо! Предложение отправлено, мы свяжемся с вами.", "ok");
      })
      .catch(() => {
        setStatus("Не удалось отправить. Попробуйте ещё раз.", "error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });

  function sendProposal(data) {
    return new Promise((resolve) => {
      console.info("Предложение поставщика (демо):", Object.fromEntries(data.entries()));
      setTimeout(resolve, 700);
    });
  }
})();

(function () {
  "use strict";

  const links = document.querySelectorAll(".nav__link");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const sectionIds = ["about", "services", "contacts"];

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target.id;
        links.forEach((link) => {
          const isActive = link.getAttribute("href") === "#" + target;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();
