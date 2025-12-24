import React from "react";
import communityLogo from "@assets/ILSpeeddcubinglogo.svg";

function AboutPage() {
  return (
    <>
      <div className="mx-auto w-8/10 text-xl">
        <h1 className="mt-2 mb-4 text-center text-4xl font-semibold">About</h1>
        <ul className="space-y-3 text-2xl" dir="rtl">
          <li>
            {
              'את התחרות הקימו ביחד יובל פורת ז"ל ויוני שטרסברג בתחילת מאי 2019 (תחרות ראשונה התחילה ב - 6/5/2019).'
            }
          </li>
          <li>
            {
              'יובל פורת ז"ל תפעל את התח"ש במסירות למשך 92 תחרויות, וכאשר תפעול התח"ש הכביד עליו, הוא העביר את השרביט לתובל סטון, שמתפעל את התחרות עד היום.'
            }
          </li>
          <li>
            {
              'בתקופתו של תובל סטון, התח"ש עברה מספר שינויים שעיקרייהם: אתר מסודר לתח"ש, כל המקצים של ה-WCA, מקצי בונוס לא מה-WCA, טבלת שיאים ועוד.'
            }
          </li>
          <li>
            {
              'בתחרות מספר 301, אחרי פגרה יחסית ארוכה. התח"ש עבר שינוי נוסף ועבר לאתר חדש, ומערכת אוטומטית של יצירת ערבובים ,קליטת תוצאות ועוד.'
            }
          </li>
          <li>
            {
              'הקהילה הישראלית לקיובינג מודה לכל מי שלקח ולוקח חלק בתפעול התח"ש ולכל מי שאיי פעם הגיש תח"ש :)'
            }
          </li>
          <li>{'יאללה, לכו תגישו תח"ש!!'}</li>
        </ul>
      </div>

      <p className="my-8 text-center text-3xl font-[475]">
        {"המערכת פותחה על ידי: עידן סהר, עומרי קהילה וסול טרייבוש"}
      </p>

      <div className="my-5 flex flex-row justify-center">
        <a href="https://www.ilcubers.com" target="_blank" className="">
          <img
            className="transition-all ease-in-out hover:scale-110"
            width="150rem"
            src={communityLogo}
            alt="ILCubers Community Logo"
          />
        </a>
      </div>
    </>
  );
}

export default AboutPage;
