import React, { useId } from "react"

function Input({
    type = 'text',
    label,
    classNameDiv = "",
    classNameInput = "",
    classNameLabel = "",
    ...props
}, ref) {
    const id = useId()

    return (
        <div className={`${classNameDiv}`}>
            {label && <label htmlFor={id} className={`${classNameLabel}`}>
                {label}
            </label>
            }
            <input type={type} ref={ref} id={id} className={`border-1 w-full ${classNameInput}`} {...props} />
        </div >
    )
}

export default React.forwardRef(Input)