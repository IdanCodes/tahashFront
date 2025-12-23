import React, { JSX } from "react";
import PrimaryButton from "../components/buttons/PrimaryButton";
import { ButtonSize } from "../components/buttons/ButtonSize";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../context/LoadingContext";
import { RoutePath } from "@shared/constants/route-path";
import { useActiveComp } from "../context/ActiveCompContext";
import { CompDisplayInfo } from "@shared/interfaces/comp-display-info";
import LoadingSpinner from "../components/LoadingSpinner";

function Home(): JSX.Element {
  const activeComp = useActiveComp();
  const navigate = useNavigate();
  const { addLoading, removeLoading } = useLoading("Home");

  /**
   * Welcome to the ILCubers weekly competition!
   * LOGO ILCubers
   * Link to ilcubers.com
   * Buttons:
   * - Log In
   * - Stats
   * - Instructions
   * -
   *
   *
   * Instructions Page:
   * In each competition you get new scrambles for each event, and you can submit times
   *
   *
   * About Page:
   *
   *
   *
   */

  return (
    <>
      <h1 className="m-3 text-center text-4xl font-bold">
        תחרות השבועית על שם יובל פורת ז"ל
      </h1>
      {activeComp.displayInfo ? (
        <>
          <div className="mx-auto flex w-4/5 flex-col">
            <AnnouncementsBox />
            <div className="mt-10 flex place-items-center justify-center">
              <PrimaryButton
                text="Log In"
                buttonSize={ButtonSize.Medium}
                onClick={() => navigate(RoutePath.Page.Login)}
              />
            </div>
          </div>
          <ActiveCompData compInfo={activeComp.displayInfo} />
        </>
      ) : (
        <LoadingSpinner />
      )}
    </>
  );
}

function ActiveCompData({ compInfo }: { compInfo: CompDisplayInfo }) {
  const activeComp = useActiveComp();

  if (!activeComp.displayInfo) return <>Loading...</>;

  return <></>;
}

function AnnouncementsBox() {
  return (
    <div className="rounded-2xl bg-gray-500/30 p-3">
      <h1 className="text-center text-3xl font-semibold">
        עדכונים והודעות חשובות
      </h1>
      <ul className="space-y-2.5" dir="rtl" style={{ fontSize: "1.35rem" }}>
        <li>ברוכים הבאים לתח"ש המחודש!!!</li>
        <li>
          {
            'המערכת החדשה של התח"ש היא גרסה ראשונית ובעתיד היא תעבור עוד עדכונים ושינויים.'
          }
        </li>
        <li>
          {
            'המערכת הזו מאשרת באופן אוטומטית את כל ההגשות, עם בקרה ידנית. המערכת הזו עוד בחיתוליה ואנחנו עוד לומדים אותה. במידה והגשתם איוונט מסויים ואחרי עדכון שבועי אתם לא רואים את התוצאה שלכם בדף התוצאות של אותו האיוונט, סביר להניח שהמערכת לא אישרה לכם באופן אוטומטי את התוצאה, והיא נפלה בין הכסאות בבקרה הידנית. אין מה להתרגש מזה, וננסה ליעל את המערכת כך שמקרים כאלו יקרו פחות ופחות. אין מה לשאול את מתפעלי התח"ש למה התוצאה שלכם לא מופיעה.'
          }
        </li>
        <li>
          {
            "במידה ואתם מוצאים תקלות, או שיש לכם רעיונות לשיפור או כל דבר, תהיה מערכת מסודרת בו תוכלו לכתוב לנו, ובינתיים אפשר "
          }
          <a href={"https://www.google.com"} className="underline">
            {"לכתוב כאן"}
          </a>
          .
        </li>
        <li>{"בהצלחה לכולם :)"}</li>
      </ul>
    </div>
  );
}

export default Home;
