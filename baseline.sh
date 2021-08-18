# baseline a deployed environment - only use these when we migrate to Prisma
yarn prisma migrate resolve --applied 20210810135138_create_initial_schema
yarn prisma migrate resolve --applied 20210810164008_fix_participant_state
yarn prisma migrate resolve --applied 20210816144550_add_widget_deleted_by
