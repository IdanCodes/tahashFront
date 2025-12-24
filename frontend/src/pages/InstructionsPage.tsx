import React from "react";

function InstructionsPage() {
  return (
    <div>
      <h1 className="mt-2 mb-5 text-center text-4xl font-semibold">
        Instructions
      </h1>
      <div className="line mx-auto w-75/100 text-2xl leading-9" dir="rtl">
        <p className="mb-3 py-1 text-center text-4xl font-semibold">
          איך מתחרים?
        </p>

        <ul className="list-decimal space-y-5" style={{ fontSize: "1.6rem" }}>
          <li>
            {"מתחברים לאתר דרך המשתמש שלכם "}
            <a
              href="https://www.worldcubeassociation.org/"
              className="underline"
              target="_blank"
            >
              באתר של ה-WCA
            </a>
            {" (במידה ואין לכם משתמש ב-WCA, מומלץ לראות את "}
            <a
              className="underline"
              href="https://www.youtube.com/watch?v=zoFEp18SR4A"
              target="_blank"
            >
              הסרטון הזה
            </a>
            {", בין 0:55 ל-2:40"}
          </li>
          <li>{"לוחצים על לשונית Scrambles בראש האתר"}</li>
          <li>{"בוחרים איוונט רצוי"}</li>
          <li>
            {"פותרים בטיימר חיצוני (stackmat ,"}
            <a href="https://cstimer.net" className="underline" target="_blank">
              CSTimer
            </a>
            {", אפליקציה בפלאפון וכו') - מומלץ stackmat"}
          </li>
          <li>{"מזינים את התוצאה, ומיד יופיע הערבוב הבא"}</li>
          <li>
            <span className="font-semibold">שימו לב</span>
            {
              ": ברגע שתאשרו את התוצאה האחרונה (חמישית או שלישית בהתאם לאיוונט) לא תוכלו לשנות את התוצאות שלכם"
            }
          </li>
          <li>
            {
              "כל התוצאות מתעדכנות אוטומטית בעמוד ה-Results בכל יום שני בשעה 21:00"
            }
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InstructionsPage;
