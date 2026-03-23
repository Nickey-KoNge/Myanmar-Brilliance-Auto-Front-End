import React, { forwardRef } from "react";
import styles from "./page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type BaseProps = {
  label?: string;
  error?: string;
  leftIcon?: IconProp;
  rightIcon?: IconProp;
};

type TextInputProps = BaseProps &
  (
    | ({ as?: "input" } & React.InputHTMLAttributes<HTMLInputElement>)
    | ({
        as: "textarea";
        rows?: number;
      } & React.TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextInputProps
>(({ label, error, leftIcon, rightIcon, as = "input", ...props }, ref) => {
  const Element = as as React.ElementType;

  return (
    <div className={styles.field}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.inputWrapper}>
        {leftIcon && (
          <span className={styles.iconLeft}>
            <FontAwesomeIcon icon={leftIcon} />
          </span>
        )}

        <Element
          {...(props as any)}
          ref={ref}
          className={`
              ${styles.textInput}
              ${leftIcon ? styles.withLeftIcon : ""}
              ${rightIcon ? styles.withRightIcon : ""}
              ${error ? styles.inputError : ""}
            `}
        />

        {rightIcon && (
          <span className={styles.iconRight}>
            <FontAwesomeIcon icon={rightIcon} />
          </span>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
});

TextInput.displayName = "TextInput";

export default TextInput;
