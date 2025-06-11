import React, { useId } from "react"

function Input({
    type = 'text',
    className = "",
    ...props
}, ref) {
    const id = useId()

    return (
        <input type={type} ref={ref} id={id} className={`${className}`} {...props} />      
    )
}

export default React.forwardRef(Input)