This is the code which encapsulates the mathematical operations and state for the viewport camera in With.

Someday we might pull this out into its own module, but for now it's only used in this project so it's easier to leave it here.

The Viewport class is meant to be interoperable with various kinds of rendering, including React and Canvas. And unit-testable!

Who knows, someday we might switch to `$framework_x` and this will help keep things nice and portable.
