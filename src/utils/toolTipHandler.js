export default function handleTooltipClick(setTooltipFn) {
    setTooltipFn(true);
    setTimeout(() => {
        setTooltipFn(false);
    }, 3000);
}