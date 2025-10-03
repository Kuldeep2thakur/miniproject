'use client'
import {
  useFirestore,
  useUser
} from "@/firebase";
import {
  useRouter
} from "next/navigation";
import {
  useEffect
} from "react";
import {
  addDoc
} from "firebase/firestore";
import {
  z
} from "zod";
import {
  useForm
} from "react-hook-form";
import {
  zodResolver
} from "@hookform/resolvers/zod";
import {
  format
} from "date-fns";
import {
  collection
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Input
} from "@/components/ui/input";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  Button
} from "@/components/ui/button";
import {
  cn
} from "@/lib/utils";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Paperclip
} from "lucide-react";
import {
  Calendar
} from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const NewTripFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date({
    required_error: "A start date is required.",
  }),
  endDate: z.date({
    required_error: "An end date is required.",
  }),
  visibility: z.enum(["private", "public", "shared"]),
  thumbnail: z.any().optional(),
});

const visibilityOptions = [{
  label: "Private",
  value: "private"
}, {
  label: "Public",
  value: "public"
}, {
  label: "Shared",
  value: "shared"
}, ]

export default function NewTripPage() {
  const {
    user,
    isUserLoading
  } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm < z.infer < typeof NewTripFormSchema >> ({
    resolver: zodResolver(NewTripFormSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "private",
    },
  });

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const onSubmit = async (data: z.infer < typeof NewTripFormSchema > ) => {
    if (!user || !firestore) return;

    try {
      let coverPhotoURL: string | undefined = undefined;

      if (data.thumbnail && data.thumbnail.length > 0) {
        const file = data.thumbnail[0] as File;
        const storage = getStorage();
        const storageRef = ref(storage, `trip-thumbnails/${user.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, file);
        coverPhotoURL = await getDownloadURL(storageRef);
      }

      const newTripData = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        visibility: data.visibility,
        ownerId: user.uid,
        coverPhotoURL: coverPhotoURL,
        coverPhotoId: !coverPhotoURL ? `trip-cover-${Math.floor(Math.random() * 6) + 1}` : undefined,
      };

      const tripsCollection = collection(firestore, 'trips');
      
      const docRef = await addDoc(tripsCollection, newTripData);

      toast({
          title: "Trip Created!",
          description: "Your new trip has been successfully created.",
      });
      router.push("/dashboard");

    } catch (error: any) {
        console.error("Error creating trip:", error);

        if (error.code && error.code.startsWith('storage/')) {
             toast({
                variant: "destructive",
                title: "Storage Error",
                description: error.message || "There was a problem uploading your thumbnail.",
            });
        } else {
            const tripsCollection = collection(firestore, 'trips');
            const permissionError = new FirestorePermissionError({
              path: tripsCollection.path,
              operation: 'create',
            });
            errorEmitter.emit('permission-error', permissionError);

            toast({
                variant: "destructive",
                title: "Error Creating Trip",
                description: error.message || "There was a problem creating your trip. Please check your permissions and try again.",
            });
        }
    }
  };

  if (isUserLoading) {
    return < p > Loading... < /p>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Trip</CardTitle>
          <CardDescription>
            Fill out the details below to start your new adventure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer in the Alps" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief summary of your upcoming trip"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-1">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col flex-1">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="thumbnail"
                render={({ field: { onChange, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Trip Thumbnail</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                {...rest}
                                value={undefined}
                                type="file" 
                                accept="image/*"
                                className="pl-10"
                                onChange={(e) => onChange(e.target.files)}
                            />
                        </div>
                    </FormControl>
                    <FormDescription>
                      Upload a cover image for your trip.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Visibility</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? visibilityOptions.find(
                                  (option) => option.value === field.value
                                )?.label
                              : "Select visibility"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search..." />
                           <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {visibilityOptions.map((option) => (
                              <CommandItem
                                value={option.label}
                                key={option.value}
                                onSelect={() => {
                                  form.setValue("visibility", option.value as "private" | "public" | "shared");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    option.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                           </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Choose who can see this trip.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? 'Creating...' : 'Create Trip'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}