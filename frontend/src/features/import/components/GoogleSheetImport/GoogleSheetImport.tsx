import { useState } from "react";
import axios from "axios";

export default function GoogleSheetImport() {

    const [link, setLink] = useState("");

    async function handleImport() {

        if (!link.trim()) return;

        try {

            const res = await axios.post(
                "http://localhost:8080/api/import/google-sheet",
                {
                    sheetUrl: link,
                }
            );

            console.log(res.data);

        } catch (err) {

            console.log(err);

        }

    }

    return (

        <div className="rounded-3xl bg-white border border-slate-200 p-8">

            <h2
                className="text-3xl font-semibold"
                style={{ fontFamily: "Newsreader" }}
            >
                Import Google Sheet
            </h2>

            <p className="text-slate-500 mt-2">

                Paste your Google Sheet link.

            </p>

            <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="mt-8 w-full rounded-xl border border-slate-300 px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
                onClick={handleImport}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition"
            >
                Import
            </button>

        </div>

    );

}