// Apply custom validation on all forms that contain required controls.
// This gives us consistent error UX across browsers (instead of native tooltips).
document.addEventListener("DOMContentLoaded", () => {
	const forms = document.querySelectorAll("form");

	forms.forEach((form) => {
		const requiredFields = form.querySelectorAll("input[required], textarea[required], select[required]");

		// Skip forms that do not have any required fields.
		if (!requiredFields.length) {
			return;
		}

		// Disable browser default messages so our themed messages are used everywhere.
		form.setAttribute("novalidate", "novalidate");

		requiredFields.forEach((field) => {
			// Create one reusable error element per field.
			ensureErrorElement(field);

			// Show message as soon as user leaves an invalid field.
			field.addEventListener("blur", () => {
				validateField(field);
			});

			// While typing, clear/update the message in real-time.
			field.addEventListener("input", () => {
				validateField(field);
			});
		});

		// On submit, block request until all required fields are valid.
		form.addEventListener("submit", (event) => {
			let isFormValid = true;

			requiredFields.forEach((field) => {
				const isFieldValid = validateField(field);
				if (!isFieldValid) {
					isFormValid = false;
				}
			});

			if (!isFormValid) {
				event.preventDefault();

				// Focus first invalid field so user can fix quickly.
				const firstInvalidField = form.querySelector(".is-invalid");
				if (firstInvalidField) {
					firstInvalidField.focus();
				}
			}
		});
	});
});

function ensureErrorElement(field) {
	const wrapper = findFieldWrapper(field);
	if (!wrapper) {
		return null;
	}

	let errorEl = wrapper.querySelector(".validation-error");
	if (!errorEl) {
		errorEl = document.createElement("p");
		errorEl.className = "validation-error";
		errorEl.setAttribute("aria-live", "polite");
		wrapper.appendChild(errorEl);
	}

	return errorEl;
}

function findFieldWrapper(field) {
	// In this project, each field sits inside a div or .form-row block.
	return field.closest(".form-row > div") || field.closest(".form-row");
}

function validateField(field) {
	const errorEl = ensureErrorElement(field);
	if (!errorEl) {
		return true;
	}

	// Reset any previous custom message before reading validity state.
	field.setCustomValidity("");

	let message = "";

	// Custom required message.
	if (field.validity.valueMissing) {
		message = `${getFieldLabel(field)} is required.`;
	} else if (field.validity.typeMismatch && field.type === "url") {
		message = "Please enter a valid URL (include http:// or https://).";
	} else if (field.validity.rangeUnderflow) {
		message = `${getFieldLabel(field)} must be at least ${field.min}.`;
	} else if (field.validity.badInput && field.type === "number") {
		message = `${getFieldLabel(field)} must be a valid number.`;
	}

	if (message) {
		field.classList.add("is-invalid");
		errorEl.textContent = message;
		return false;
	}

	field.classList.remove("is-invalid");
	errorEl.textContent = "";
	return true;
}

function getFieldLabel(field) {
	if (field.id) {
		const label = document.querySelector(`label[for="${field.id}"]`);
		if (label && label.textContent) {
			return label.textContent.trim();
		}
	}

	// Fallback if a label is missing.
	return "This field";
}
