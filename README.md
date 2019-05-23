# Federation Migration Example 🚀

This project accompanies the [schema stitching to federation migration guide]()

- `before-migration` houses a project with mocked out resolvers for a users and reservations service as well as a schema stitching gateway. 
- `after-migration` uses the same projects with the addition of a gateway using federation. The stitching gateway was left in the project to make sure the service changes were backwards-compatible
