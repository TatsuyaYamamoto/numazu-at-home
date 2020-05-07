import React, {
  forwardRef,
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  Ref,
} from "react";

type NativeAProps = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>;

const A = forwardRef((props: NativeAProps, ref: Ref<HTMLAnchorElement>) => {
  const { children, ...others } = props;
  return (
    <a
      ref={ref}
      css={`
        display: inline-block;
        color: rgb(123, 156, 220);
        text-decoration: none;
        font-weight: 600;
        margin: 0 2px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      `}
      {...others}
    >
      {children}
    </a>
  );
});

export default A;
