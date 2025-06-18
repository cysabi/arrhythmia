import useClient from "../client/useClient";


export const StartScreen = () => {
    const send = useClient()[2];

    return (
        <div className="flex items-center gap-5">
            <div>start?</div>
            <button onClick={() => send("start")}>start!</button>
        </div>
    )
}