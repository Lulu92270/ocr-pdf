import "intl-tel-input/build/css/intlTelInput.css"

const TextOCR = ({readText}) => {

  return (
    <div>
      <div>Recognized ttext:</div>
      <div>
        <textarea
          rows="30"
          cols="100"
          name="name"
          defaultValue={readText}
        />
      </div>
    </div>
  )
}



export default TextOCR
