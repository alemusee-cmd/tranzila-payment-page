// מחכים שהדף ייטען במלואו לפני שמתחילים להפעיל את הקוד
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================
  // 1. הגדרת הסכום לתשלום מתוך דף הצ'קאאוט
  // ==========================================

  // מושכים את השדה הנסתר שמכיל את הסכום שהשרת חישב
  const amountInput = document.getElementById("checkout-total-amount");

  // בודקים אם השדה קיים ומושכים את הערך שלו. אם לא, נגדיר כברירת מחדל "0.00"
  const finalAmount = amountInput ? amountInput.value : "0.00";

  // מעדכנים את שורת הסיכום במסך כדי שהלקוח יראה את הסכום
  const summaryDisplay = document.querySelector(".summary-amount");
  if (summaryDisplay) {
    summaryDisplay.innerText = "₪" + finalAmount;
  }

  // ==========================================
  // 2. אתחול והגדרת מערכת טרנזילה (Hosted Fields)
  // ==========================================

  const tzlaInstance = TzlaHostedFields.create({
    terminal_name: "your_terminal_name", // חובה להחליף לשם המסוף של הלקוח
    env: "test", // סביבת בדיקות. כשתעלו לאוויר, שנו ל-"prod"
    lang: "he", // שפת השגיאות והממשק

    // מיפוי האלמנטים הריקים ב-HTML לשדות המאובטחים של טרנזילה
    fields: {
      credit_card_number: {
        selector: "#tranzila-card-number",
        placeholder: "0000 0000 0000 0000",
      },
      expiry: {
        selector: "#tranzila-expiry",
        placeholder: "MM/YY",
      },
      cvv: {
        selector: "#tranzila-cvv",
        placeholder: "123",
      },
    },

    // עיצוב הטקסט המוקלד *בתוך* השדות (מותאם לעיצוב החיצוני שלנו)
    styles: {
      input: {
        "font-family": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        "font-size": "16px",
        color: "#333333", // טקסט כהה ויוקרתי
        "letter-spacing": "1.5px", // ריווח בין הספרות לקריאות טובה יותר
      },
      "::placeholder": {
        color: "#b0b0b0", // אפור בהיר לטקסט הרקע
      },
      "input.valid": {
        color: "#10b981", // ירוק אם הנתון חוקי (למשל 16 ספרות תקינות)
      },
      "input.invalid": {
        color: "#e74c3c", // אדום אם הלקוח הזין נתון שגוי
      },
    },
  });

  // ==========================================
  // 3. טיפול בלחיצה על כפתור "לתשלום מאובטח"
  // ==========================================

  const submitBtn = document.getElementById("submit-payment-btn");

  submitBtn.addEventListener("click", function (event) {
    event.preventDefault(); // עוצרים את רענון הדף הטבעי של הדפדפן

    // -- שינוי מצב הכפתור בזמן העיבוד --
    submitBtn.innerText = "מעבד תשלום, אנא המתן...";
    submitBtn.style.opacity = "0.8";
    submitBtn.disabled = true; // חוסמים לחיצה כפולה כדי למנוע חיוב כפול!

    // שולחים את הבקשה המאובטחת לשרתי טרנזילה
    tzlaInstance
      .charge({
        amount: finalAmount, // <--- אנו מעבירים את הסכום ששאבנו מהצ'קאאוט למעלה
        currency: "ILS", // מטבע (שקלים חדשים)
      })
      .then(function (response) {
        // -- העסקה עברה בהצלחה! --
        console.log("עסקה אושרה:", response);

        submitBtn.innerText = "התשלום עבר בהצלחה! ✔️";
        submitBtn.style.background = "#10b981"; // וידוא צבע ירוק
        submitBtn.style.opacity = "1";

        // בדרך כלל כאן נעביר את הלקוח לדף "תודה רבה"
        // window.location.href = "/thank-you-page-url";
      })
      .catch(function (error) {
        // -- העסקה נכשלה או נדחתה --
        console.error("שגיאה בעסקה:", error);

        submitBtn.innerText = "שגיאה בחיוב, נסה שוב";
        submitBtn.style.background = "#e74c3c"; // שינוי לאדום להתריע על שגיאה
        submitBtn.style.opacity = "1";
        submitBtn.disabled = false; // משחררים את הכפתור כדי שהלקוח יוכל לתקן ולנסות שוב

        // מציגים הודעת שגיאה ללקוח (אפשר להחליף בפופ-אפ מעוצב יותר מ-alert)
        alert("שגיאה בסליקה: " + error.message);
      });
  });
});
